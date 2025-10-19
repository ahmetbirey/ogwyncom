import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Firebase config - .env dosyanızdan alınacak
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Validate Firebase config
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

// Firebase'i başlat (sadece gerekli ortam değişkenleri varsa)
let db = null;
if (missingEnvVars.length === 0) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.warn('⚠️  Firebase başlatma hatası:', error.message);
  }
}

// Site base URL'i - kendi domain'inizle değiştirin
const BASE_URL = 'https://ogwyn.com';

// Statik sayfalar
const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/bulten', priority: '0.8', changefreq: 'weekly' },
  { url: '/broadcast', priority: '0.8', changefreq: 'weekly' },
  { url: '/hub', priority: '0.8', changefreq: 'weekly' },
  { url: '/magaza', priority: '0.8', changefreq: 'weekly' },
  { url: '/ogwyn-ai', priority: '0.8', changefreq: 'monthly' },
  { url: '/iletisim', priority: '0.7', changefreq: 'monthly' },
  { url: '/gizlilik-politikasi', priority: '0.3', changefreq: 'yearly' }
];

async function generateSitemap() {
  try {
    console.log('🚀 Sitemap oluşturuluyor...');
    
    let articles = [];
    
    // Firebase yapılandırması varsa makaleleri çekmeye çalış
    if (db) {
      try {
        // Firebase'den makaleleri çek
        const articlesRef = collection(db, 'articles');
        const articlesSnapshot = await getDocs(articlesRef);
        
        articlesSnapshot.forEach((doc) => {
          const data = doc.data();
          // Check for published articles using either 'published' field or 'status' field
          const isPublished = data.published === true || data.status === 'published' || data.status === 'active';
          
          if (data.slug && isPublished) {
            // Handle Firestore timestamp conversion
            let lastmod;
            try {
              if (data.updatedAt && data.updatedAt.toDate) {
                lastmod = data.updatedAt.toDate().toISOString();
              } else if (data.createdAt && data.createdAt.toDate) {
                lastmod = data.createdAt.toDate().toISOString();
              } else if (data.publishedAt && data.publishedAt.toDate) {
                lastmod = data.publishedAt.toDate().toISOString();
              } else {
                lastmod = new Date().toISOString();
              }
            } catch (dateError) {
              console.warn(`Date conversion error for article ${data.title}:`, dateError.message);
              lastmod = new Date().toISOString();
            }
            
            articles.push({
              slug: data.slug,
              lastmod: lastmod,
              title: data.title
            });
          }
        });
      } catch (firebaseError) {
        console.warn('⚠️  Firebase bağlantı hatası:', firebaseError.message);
        console.log('📝 Sadece statik sayfalarla sitemap oluşturuluyor...');
      }
    } else {
      console.log('⚠️  Firebase yapılandırması eksik, sadece statik sayfalar dahil ediliyor.');
    }

    console.log(`📰 ${articles.length} makale bulundu`);

    // XML sitemap oluştur
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

`;

    // Statik sayfaları ekle
    staticPages.forEach(page => {
      const lastmod = new Date().toISOString().split('T')[0]; // Betiğin çalıştığı günün tarihini kullan
      sitemap += `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>

`;
    });

    // Makale sayfalarını ekle
    articles.forEach(article => {
      // Tarih formatının her zaman geçerli olduğundan emin olalım
      let lastmod;
      try {
        lastmod = new Date(article.lastmod).toISOString().split('T')[0];
      } catch (e) {
        lastmod = new Date().toISOString().split('T')[0]; // Hata durumunda bugünün tarihini kullan
      }
      sitemap += `  <url>
    <loc>${BASE_URL}/article/${article.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

`;
    });

    sitemap += `</urlset>`;

    // Sitemap dosyasını kaydet
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');

    console.log('✅ Sitemap başarıyla oluşturuldu!');
    console.log(`📍 Konum: ${sitemapPath}`);
    console.log(`📊 Toplam URL: ${staticPages.length + articles.length}`);
    
  } catch (error) {
    console.error('❌ Sitemap oluşturulurken hata:', error);
    process.exit(1);
  }
}

// Script'i çalıştır
generateSitemap();

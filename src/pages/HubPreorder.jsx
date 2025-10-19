import { useState, useEffect } from 'react';
import AnimatedSection from '../components/AnimatedSection';
import { submitHubPreorder } from '../config/firebase';
import BackgroundImageLoader from '../components/BackgroundImageLoader';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, User, Mail, Phone, Building, MessageSquare, Loader2, ArrowRight } from 'lucide-react';

const HubPreorder = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    interestedFeatures: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const features = [
    'Akıllı SEO Analizörü',
    'E-Ticaret Optimizasyonu',
    'Ekip İletişimi & CRM',
    'Kişiselleştirilmiş AI Agent',
    'Sosyal Medya Chatbotları'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation - clear error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleFieldBlur = (fieldName) => {
    setTouchedFields(prev => ({
      ...prev,
      [fieldName]: true
    }));

    const error = validateField(fieldName, formData[fieldName]);
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      interestedFeatures: prev.interestedFeatures.includes(feature)
        ? prev.interestedFeatures.filter(f => f !== feature)
        : [...prev.interestedFeatures, feature]
    }));
  };

  // Individual field validation functions
  const validateName = (name) => {
    if (!name.trim()) return 'İsim alanı zorunludur';
    if (name.trim().length < 2) return 'İsim en az 2 karakter olmalıdır';
    if (name.trim().length > 50) return 'İsim en fazla 50 karakter olabilir';
    if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(name.trim())) return 'İsim sadece harf içermelidir';
    return null;
  };

  const validateEmail = (email) => {
    if (!email.trim()) return 'E-posta alanı zorunludur';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Geçerli bir e-posta adresi girin';
    if (email.length > 100) return 'E-posta adresi çok uzun';
    return null;
  };

  const validatePhone = (phone) => {
    if (!phone.trim()) return 'Telefon alanı zorunludur';
    const cleanPhone = phone.replace(/\s+/g, '').replace(/[()-]/g, '');
    if (!/^(\+90|0)?[5][0-9]{9}$/.test(cleanPhone)) {
      return 'Geçerli bir Türkiye telefon numarası girin (örn: 0555 123 4567)';
    }
    return null;
  };

  const validateCompany = (company) => {
    if (company && company.length > 100) return 'Şirket adı en fazla 100 karakter olabilir';
    return null;
  };

  const validateMessage = (message) => {
    if (message && message.length > 500) return 'Mesaj en fazla 500 karakter olabilir';
    return null;
  };

  // Validate individual field
  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case 'name':
        return validateName(value);
      case 'email':
        return validateEmail(value);
      case 'phone':
        return validatePhone(value);
      case 'company':
        return validateCompany(value);
      case 'message':
        return validateMessage(value);
      default:
        return null;
    }
  };

  // Validate entire form
  const validateForm = () => {
    const errors = {};
    
    const nameError = validateName(formData.name);
    if (nameError) errors.name = nameError;
    
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;
    
    const phoneError = validatePhone(formData.phone);
    if (phoneError) errors.phone = phoneError;
    
    const companyError = validateCompany(formData.company);
    if (companyError) errors.company = companyError;
    
    const messageError = validateMessage(formData.message);
    if (messageError) errors.message = messageError;
    
    return Object.keys(errors).length > 0 ? errors : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation display
    setTouchedFields({
      name: true,
      email: true,
      phone: true,
      company: true,
      message: true
    });

    const validationErrors = validateForm();
    if (validationErrors) {
      setFieldErrors(validationErrors);
      setError('Lütfen form hatalarını düzeltin ve tekrar deneyin.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setFieldErrors({});

    try {
      await submitHubPreorder(formData);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting preorder:', err);
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="content-section" style={{ paddingTop: '12rem', paddingBottom: '6rem', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px' }}>
          <CheckCircle style={{ width: '64px', height: '64px', color: 'var(--primary-green)', margin: '0 auto 2rem' }} />
          <h1 className="page-title">Başvurunuz Alındı!</h1>
          <p className="section-description">
            OGW HUB ön sipariş başvurunuz başarıyla iletildi. Ekibimiz en kısa sürede sizinle iletişime geçecek ve ürün hazır olduğunda öncelikli erişim sağlayacağız.
          </p>
          <div style={{ marginTop: '3rem' }}>
            <a href="/hub" className="btn btn-primary cta-button">
              OGW HUB'a Geri Dön
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>OGW HUB Ön Sipariş - Pazarlama Araçlarınız Tek Yerde</title>
        <link rel="canonical" href="https://ogwyn.com/hub/on-siparis" />
        <meta name="description" content="OGW HUB'ın lansmanından önce ön sipariş vererek özel fiyatlandırma ve öncelikli erişim fırsatını kaçırmayın. Formu doldurun, ekibimiz sizinle iletişime geçsin." />
      </Helmet>

      <AnimatedSection 
        animationType="content-section" 
        style={{ paddingTop: '12rem', paddingBottom: '6rem' }}
      >
        <a href="/hub" className="section-tag">OGW HUB ÖN SİPARİŞ</a>
        <h1 className="page-title">Pazarlama Gücünüzü<br />Artırmaya Hazır mısınız?</h1>
        <p className="section-description">
          OGW HUB'ın lansmanından önce ön sipariş vererek özel fiyatlandırma ve öncelikli erişim fırsatını kaçırmayın. Formu doldurun, ekibimiz sizinle iletişime geçsin.
        </p>
      </AnimatedSection>

      <div className="ai-features-container">
        <div className="ai-feature-block">
          <BackgroundImageLoader 
            src="/images/seo-analyser.jpg"
            className="ai-feature-image"
          />
          <div className="ai-feature-text">
            <h3>Neden Ön Sipariş Vermelisiniz?</h3>
            <div style={{ textAlign: 'left', color: 'var(--text-gray)', fontSize: '1.1rem', lineHeight: '1.8' }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>🎯</span>
                <div>
                  <strong style={{ color: 'var(--white)', display: 'block', marginBottom: '0.25rem' }}>%40'a Varan Erken Kuş İndirimi</strong>
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>⚡</span>
                <div>
                  <strong style={{ color: 'var(--white)', display: 'block', marginBottom: '0.25rem' }}>Öncelikli Erişim</strong>
                  <span>İlk kullananlar arasında olun</span>
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>🎓</span>
                <div>
                  <strong style={{ color: 'var(--white)', display: 'block', marginBottom: '0.25rem' }}>Ücretsiz Eğitim</strong>
                  <span>ve kurulum desteği</span>
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>🔧</span>
                <div>
                  <strong style={{ color: 'var(--white)', display: 'block', marginBottom: '0.25rem' }}>Kişisel Danışmanlık</strong>
                  <span>İhtiyaçlarınıza özel kurulum</span>
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>🎁</span>
                <div>
                  <strong style={{ color: 'var(--white)', display: 'block', marginBottom: '0.25rem' }}>Bonus Özellikler</strong>
                  <span>Ek modüller hediye</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatedSection animationType="content-section" style={{ paddingTop: '6rem' }}>
        <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="section-title">Ön Sipariş Formu</h2>
          <p className="section-description" style={{ margin: '0 auto 3rem auto' }}>
            Bilgilerinizi paylaşın, size özel teklifimizi hazırlayalım.
          </p>

          <form onSubmit={handleSubmit} style={{ textAlign: 'left', width: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', color: 'var(--white)', fontSize: '1rem', fontWeight: '500' }}>
                  <User style={{ width: '18px', height: '18px', marginRight: '0.5rem' }} />
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur('name')}
                  required
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: `1px solid ${fieldErrors.name && touchedFields.name ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)'}`,
                    borderRadius: '10px',
                    color: 'var(--white)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = fieldErrors.name && touchedFields.name ? '#ff6b6b' : 'var(--primary-green)'}
                  placeholder="Adınız ve soyadınız"
                />
                {fieldErrors.name && touchedFields.name && (
                  <div style={{ color: '#ff6b6b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    {fieldErrors.name}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', color: 'var(--white)', fontSize: '1rem', fontWeight: '500' }}>
                  <Mail style={{ width: '18px', height: '18px', marginRight: '0.5rem' }} />
                  E-posta *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur('email')}
                  required
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: `1px solid ${fieldErrors.email && touchedFields.email ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)'}`,
                    borderRadius: '10px',
                    color: 'var(--white)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = fieldErrors.email && touchedFields.email ? '#ff6b6b' : 'var(--primary-green)'}
                  placeholder="ornek@email.com"
                />
                {fieldErrors.email && touchedFields.email && (
                  <div style={{ color: '#ff6b6b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    {fieldErrors.email}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', color: 'var(--white)', fontSize: '1rem', fontWeight: '500' }}>
                  <Phone style={{ width: '18px', height: '18px', marginRight: '0.5rem' }} />
                  Telefon *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur('phone')}
                  required
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: `1px solid ${fieldErrors.phone && touchedFields.phone ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)'}`,
                    borderRadius: '10px',
                    color: 'var(--white)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = fieldErrors.phone && touchedFields.phone ? '#ff6b6b' : 'var(--primary-green)'}
                  placeholder="+90 555 123 4567"
                />
                {fieldErrors.phone && touchedFields.phone && (
                  <div style={{ color: '#ff6b6b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    {fieldErrors.phone}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', color: 'var(--white)', fontSize: '1rem', fontWeight: '500' }}>
                  <Building style={{ width: '18px', height: '18px', marginRight: '0.5rem' }} />
                  Şirket/Kuruluş
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur('company')}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: `1px solid ${fieldErrors.company && touchedFields.company ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)'}`,
                    borderRadius: '10px',
                    color: 'var(--white)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = fieldErrors.company && touchedFields.company ? '#ff6b6b' : 'var(--primary-green)'}
                  placeholder="Şirket adınız (opsiyonel)"
                />
                {fieldErrors.company && touchedFields.company && (
                  <div style={{ color: '#ff6b6b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    {fieldErrors.company}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '1rem', color: 'var(--white)', fontSize: '1rem', fontWeight: '500' }}>
                Hangi özellikler sizi daha çok ilgilendiriyor? (Birden fazla seçebilirsiniz)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {features.map((feature) => (
                  <label
                    key={feature}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.75rem',
                      background: formData.interestedFeatures.includes(feature) 
                        ? 'rgba(0, 255, 30, 0.1)' 
                        : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${formData.interestedFeatures.includes(feature) 
                        ? 'var(--primary-green)' 
                        : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      fontSize: '0.9rem'
                    }}
                    onMouseEnter={(e) => {
                      if (!formData.interestedFeatures.includes(feature)) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!formData.interestedFeatures.includes(feature)) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.interestedFeatures.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      style={{ display: 'none' }}
                    />
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        marginRight: '0.75rem',
                        border: `2px solid ${formData.interestedFeatures.includes(feature) 
                          ? 'var(--primary-green)' 
                          : 'rgba(255, 255, 255, 0.3)'}`,
                        borderRadius: '3px',
                        background: formData.interestedFeatures.includes(feature) 
                          ? 'var(--primary-green)' 
                          : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s'
                      }}
                    >
                      {formData.interestedFeatures.includes(feature) && (
                        <CheckCircle style={{ width: '12px', height: '12px', color: 'var(--main-bg)' }} />
                      )}
                    </div>
                    {feature}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', color: 'var(--white)', fontSize: '1rem', fontWeight: '500' }}>
                <MessageSquare style={{ width: '18px', height: '18px', marginRight: '0.5rem' }} />
                Ek Mesaj
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur('message')}
                rows={4}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: `1px solid ${fieldErrors.message && touchedFields.message ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)'}`,
                  borderRadius: '10px',
                  color: 'var(--white)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => e.target.style.borderColor = fieldErrors.message && touchedFields.message ? '#ff6b6b' : 'var(--primary-green)'}
                placeholder="Özel ihtiyaçlarınız, sorularınız veya projeleriniz hakkında bilgi verebilirsiniz..."
              />
              {fieldErrors.message && touchedFields.message && (
                <div style={{ color: '#ff6b6b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  {fieldErrors.message}
                </div>
              )}
            </div>

            {error && (
              <div style={{
                padding: '1rem',
                background: 'rgba(255, 0, 0, 0.1)',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                borderRadius: '8px',
                color: '#ff6b6b',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary cta-button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    Ön Sipariş Ver
                    <ArrowRight style={{ width: '20px', height: '20px' }} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </AnimatedSection>

      <AnimatedSection animationType="content-section" style={{ paddingTop: '6rem' }}>
        <h2 className="section-title">Sıkça Sorulan Sorular</h2>
        <div style={{ maxWidth: '800px', textAlign: 'left', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--white)', marginBottom: '0.5rem' }}>Ön sipariş verdiğimde ne zaman erişim sağlayabilirim?</h3>
            <p style={{ color: 'var(--text-gray)', lineHeight: '1.6' }}>
              OGW HUB beta sürümü 2024 yılının 2. çeyreğinde kullanıma sunulacak. Ön sipariş veren müşterilerimiz öncelikli erişim hakkına sahip olacak.
            </p>
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--white)', marginBottom: '0.5rem' }}>Ön sipariş ücreti var mı?</h3>
            <p style={{ color: 'var(--text-gray)', lineHeight: '1.6' }}>
              Hayır, ön sipariş tamamen ücretsizdir. Sadece iletişim bilgilerinizi alıyor ve size özel fiyat teklifimizi sunuyoruz.
            </p>
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--white)', marginBottom: '0.5rem' }}>Hangi fiyatlandırma seçenekleri mevcut?</h3>
            <p style={{ color: 'var(--text-gray)', lineHeight: '1.6' }}>
              Aylık, yıllık ve kurumsal paketlerimiz bulunuyor. Ön sipariş veren müşterilerimize özel indirimli fiyatlar sunuyoruz.
            </p>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
};

export default HubPreorder;

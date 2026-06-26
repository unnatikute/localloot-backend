export default function AuthImagePanel({ image, alt, title, description, highlights = [] }) {
  return (
    <>
      {/* Desktop illustration */}
      <div className="auth-illustration hidden lg:flex">
        <div className="auth-illustration-inner group">
          <img
            src={image}
            alt={alt}
            className="auth-illustration-img"
            loading="lazy"
          />
          <div className="auth-illustration-overlay" />
          <div className="auth-illustration-content">
            <h3 className="auth-illustration-title">{title}</h3>
            <p className="auth-illustration-desc">{description}</p>
            {highlights.length > 0 && (
              <ul className="auth-illustration-list">
                {highlights.map((item) => (
                  <li key={item} className="auth-illustration-list-item">
                    <span className="auth-illustration-dot" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Mobile banner */}
      <div className="auth-mobile-banner lg:hidden">
        <img src={image} alt={alt} className="auth-mobile-banner-img" loading="lazy" />
        <div className="auth-mobile-banner-overlay" />
        <div className="auth-mobile-banner-text">
          <p className="font-semibold text-white text-sm sm:text-base">{title}</p>
        </div>
      </div>
    </>
  );
}

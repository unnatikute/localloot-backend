import { getCategoryBanner, DEFAULT_IMAGES } from '../utils/images.js';
import SafeImage from './SafeImage.jsx';

export default function TrendingBanner({ image, title, subtitle }) {
  const bannerSrc = image && String(image).trim() ? image : DEFAULT_IMAGES.banner;

  return (
    <div className="relative rounded-xl overflow-hidden h-48 mb-6">
      <SafeImage
        src={bannerSrc}
        alt={title}
        fallback={DEFAULT_IMAGES.banner}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20"></div>
      <div className="relative z-10 p-6 text-white">
        <h2 className="text-2xl font-bold">{title}</h2>
        {subtitle && <p className="opacity-90">{subtitle}</p>}
      </div>
    </div>
  );
}

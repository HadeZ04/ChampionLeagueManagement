import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  const current = i18n.language || 'vi'

  const handleChange = (lng) => {
    i18n.changeLanguage(lng)
    // i18next-browser-languagedetector sẽ tự lưu vào localStorage
  }

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <Globe size={13} className="text-white/70" />
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleChange('vi')}
          className={`
            px-2 py-0.5 rounded transition-all duration-200 font-medium
            ${current.startsWith('vi')
              ? 'bg-[#00d4ff] text-[#0a1929]'
              : 'text-white/70 hover:text-white hover:bg-white/10'}
          `}
        >
          VI
        </button>
        <span className="text-white/30">|</span>
        <button
          onClick={() => handleChange('en')}
          className={`
            px-2 py-0.5 rounded transition-all duration-200 font-medium
            ${current.startsWith('en')
              ? 'bg-[#00d4ff] text-[#0a1929]'
              : 'text-white/70 hover:text-white hover:bg-white/10'}
          `}
        >
          EN
        </button>
      </div>
    </div>
  )
}

export default LanguageSwitcher

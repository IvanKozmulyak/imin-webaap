import { useState } from 'react'

function RegistrationForm() {
  const [formData, setFormData] = useState({
    event: 'Rap Night Hague | December 2025',
    name: '',
    email: 'johnblack@...',
    telegram: '@ ...',
    age: '-',
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
      <div>
        <label className="block text-white text-sm mb-2">
          Choose an Event<span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={formData.event}
            onChange={(e) => handleInputChange('event', e.target.value)}
            className="w-full bg-gray-900/60 border border-red-500/60 rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 shadow-[0_0_8px_rgba(239,68,68,0.3)]"
          >
            <option value="Rap Night Hague | December 2025">Rap Night Hague | December 2025</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-white text-sm mb-2">
          Name<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="w-full bg-gray-900/60 border border-red-500/60 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 shadow-[0_0_8px_rgba(239,68,68,0.3)]"
          placeholder="."
        />
      </div>

      <div>
        <label className="block text-white text-sm mb-2">
          Email<span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="w-full bg-gray-900/60 border border-red-500/60 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 shadow-[0_0_8px_rgba(239,68,68,0.3)]"
        />
      </div>

      <div>
        <label className="block text-white text-sm mb-2">
          Telegram<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.telegram}
          onChange={(e) => handleInputChange('telegram', e.target.value)}
          className="w-full bg-gray-900/60 border border-red-500/60 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 shadow-[0_0_8px_rgba(239,68,68,0.3)]"
        />
      </div>

      <div>
        <label className="block text-white text-sm mb-2">
          Your Age<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.age}
          onChange={(e) => handleInputChange('age', e.target.value)}
          className="w-full bg-gray-900/60 border border-red-500/60 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 shadow-[0_0_8px_rgba(239,68,68,0.3)]"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-white text-black font-bold py-4 rounded-lg uppercase tracking-wider hover:bg-gray-100 transition-colors mt-6"
      >
        SUBMIT
      </button>
    </form>
  )
}

export default RegistrationForm


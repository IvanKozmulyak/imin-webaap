'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EventDto } from '@/lib/types/event';
import CustomDropdown, { DropdownOption } from '../components/CustomDropdown';

const LANGUAGES = [
  { code: 'EN', name: 'English' },
  { code: 'NL', name: 'Dutch' },
  { code: 'FR', name: 'French' },
  { code: 'UA', name: 'Ukrainian' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    eventId: '',
    name: '',
    email: '',
    telegram: '',
    age: '',
    languagesISpeak: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const eventsRes = await fetch('/api/events/upcoming');
        
        if (!eventsRes.ok) {
          throw new Error(`HTTP error! status: ${eventsRes.status}`);
        }
        
        const eventsData = await eventsRes.json();

        // Handle both wrapped response { success: true, data: [...] } and direct array
        if (Array.isArray(eventsData)) {
          setEvents(eventsData);
        } else if (eventsData.success && Array.isArray(eventsData.data)) {
          setEvents(eventsData.data);
        } else {
          console.error('Invalid events response format:', eventsData);
          setEvents([]);
        }
        } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleLanguageToggle = (code: string) => {
    setFormData(prev => ({
      ...prev,
      languagesISpeak: prev.languagesISpeak.includes(code)
        ? prev.languagesISpeak.filter(l => l !== code)
        : [...prev.languagesISpeak, code],
    }));
    // Clear error when user selects a language
    if (errors.languagesISpeak) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.languagesISpeak;
        return newErrors;
      });
    }
  };

  const validateField = (fieldName: string, value: string | number | string[]) => {
    const newErrors: Record<string, string> = { ...errors };
    
    switch (fieldName) {
      case 'eventId':
        if (!value || value === '') {
          newErrors.eventId = 'Please select an event';
        } else {
          delete newErrors.eventId;
        }
        break;
      case 'name':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          newErrors.name = 'Name is required';
        } else {
          delete newErrors.name;
        }
        break;
      case 'email':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          newErrors.email = 'Email is required';
        } else if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'telegram':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          newErrors.telegram = 'Telegram username is required';
        } else {
          delete newErrors.telegram;
        }
        break;
      case 'age':
        if (!value || value === '') {
          newErrors.age = 'Age is required';
        } else if (typeof value === 'string') {
          const ageNum = Number(value);
          if (isNaN(ageNum)) {
            newErrors.age = 'Please enter a valid age';
          } else if (ageNum < 18) {
            newErrors.age = 'Age must be at least 18';
          } else if (ageNum > 99) {
            newErrors.age = 'Age must be at most 99';
          } else {
            delete newErrors.age;
          }
        } else {
          delete newErrors.age;
        }
        break;
      case 'languagesISpeak':
        if (!value || (Array.isArray(value) && value.length === 0)) {
          newErrors.languagesISpeak = 'Please select at least one language';
        } else {
          delete newErrors.languagesISpeak;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.eventId || formData.eventId === '') {
      newErrors.eventId = 'Please select an event';
    }
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Name is required';
    }
    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.telegram || formData.telegram.trim() === '') {
      newErrors.telegram = 'Telegram username is required';
    }
    if (!formData.age || formData.age === '') {
      newErrors.age = 'Age is required';
    } else {
      const ageNum = Number(formData.age);
      if (isNaN(ageNum)) {
        newErrors.age = 'Please enter a valid age';
      } else if (ageNum < 18) {
        newErrors.age = 'Age must be at least 18';
      } else if (ageNum > 99) {
        newErrors.age = 'Age must be at most 99';
      }
    }
    if (!formData.languagesISpeak || formData.languagesISpeak.length === 0) {
      newErrors.languagesISpeak = 'Please select at least one language';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/events/${formData.eventId}/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          telegram: formData.telegram,
          age: parseInt(formData.age),
          languagesISpeak: formData.languagesISpeak,
        }),
      });

      const data = await response.json();

      // Check if response is successful (200 or 201 status) and doesn't have error field
      if (response.ok && !data.error) {
        // Redirect to success page with eventId to fetch ticket URL
        const eventId = formData.eventId || data.eventId;
        const successUrl = eventId 
          ? `/success?eventId=${encodeURIComponent(eventId)}`
          : '/success';
        router.push(successUrl);
      } else {
        // Handle error response
        if (data.fieldErrors) {
          setErrors(data.fieldErrors);
        } else if (data.error) {
          setError(data.error);
        } else {
          setError('Registration failed');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedEvent = events.find(e => e.id === formData.eventId);
  const formatEventDisplay = (event: EventDto) => {
    const date = new Date(event.eventDateTime);
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;
    return `${event.name}  |  ${month} ${day}, ${year} at ${time}`;
  };

  const eventOptions: DropdownOption[] = events.map((event) => ({
    value: event.id,
    label: formatEventDisplay(event),
  }));

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background Image */}
      <img
        src="/assets/background.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ 
          zIndex: 0
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center pt-20 px-6">
        {/* Logo */}
        <svg
          width="77"
          height="102"
          viewBox="0 0 77 102"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mb-16"
        >
          <path
            d="M20.9239 47.2449V1.24693C20.9239 0.554192 21.6817 0 22.8725 0H37.7034C38.4612 0 39.219 0.277095 39.4355 0.831288L47.5546 14.409C47.8794 14.8939 48.4207 15.4481 48.962 15.4481C49.6115 15.4481 50.0445 14.8939 50.3693 14.409L58.2719 0.831288C58.7049 0.277095 59.3544 0 60.2205 0H75.0514C76.134 0 77 0.554192 77 1.24693V47.2449C77 48.0069 76.134 48.4918 75.0514 48.4918H62.1691C61.0865 48.4918 60.2205 48.0069 60.2205 47.2449V26.2548C60.1122 25.7007 59.6792 25.6314 59.3544 26.1856L50.5858 38.7242C49.2867 40.1789 47.7711 39.3476 47.3381 38.7242L38.5695 26.1856C38.2447 25.6314 37.7034 25.7007 37.7034 26.2548V47.2449C37.7034 48.0069 36.7291 48.4918 35.7548 48.4918H22.8725C21.6817 48.4918 20.9239 48.0069 20.9239 47.2449Z"
            fill="white"
          />
          <path
            d="M0 54.7336V99.9385C0 100.619 0.755958 101.164 1.8359 101.164H14.7952C15.9832 101.164 16.7391 100.619 16.7391 99.9385V54.7336C16.7391 54.0528 15.9832 53.5082 14.7952 53.5082H1.8359C0.755958 53.5082 0 54.0528 0 54.7336Z"
            fill="white"
          />
          <path
            d="M42.3419 82.4647L57.6589 101.169C58.0484 101.654 59.0868 102 59.9954 102H74.5337C75.8317 102 77 101.446 77 100.753V54.7551C77 54.0624 75.8317 53.5082 74.5337 53.5082H59.0868C57.6589 53.5082 56.6205 54.0624 56.6205 54.7551V73.6669C56.3609 74.2904 55.3224 74.3597 55.0628 73.8055L40.7842 54.3395C40.3948 53.7853 39.4861 53.5082 38.4477 53.5082H23.6498C22.222 53.5082 20.9239 54.0624 20.9239 54.7551V100.753C20.9239 101.446 22.222 102 23.6498 102H38.5775C39.8756 102 41.0438 101.446 41.0438 100.753V82.6033C41.1736 82.0491 41.9524 81.9105 42.3419 82.4647Z"
            fill="white"
          />
          <path
            d="M0 1.24693V47.2449C0 47.9376 0.755958 48.4918 1.8359 48.4918H14.7952C15.9832 48.4918 16.7391 47.9376 16.7391 47.2449V1.24693C16.7391 0.554192 15.9832 0 14.7952 0H1.8359C0.755958 0 0 0.554192 0 1.24693Z"
            fill="white"
          />
        </svg>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-[526px]">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-[27px] border border-red-500 bg-red-500/10 backdrop-blur-[15px]">
              <p className="text-white text-center text-sm">{error}</p>
            </div>
          )}

          {/* Event Selection */}
          <div className="mb-[26px]">
            <label className="block mb-2 text-white text-xs font-normal">
              Choose an Event <span className="text-[#CC0000]">*</span>
            </label>
            <CustomDropdown
              options={eventOptions}
              value={formData.eventId}
              onChange={(value) => {
                setFormData({ ...formData, eventId: value });
                validateField('eventId', value);
              }}
              placeholder={loading ? 'Loading events...' : events.length === 0 ? 'No events available' : 'Select an event'}
              disabled={loading || events.length === 0}
              className={errors.eventId ? 'border-red-500' : ''}
            />
            {errors.eventId && (
              <div className="mt-1 flex items-center gap-1">
                <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-red-500 text-xs">{errors.eventId}</p>
              </div>
            )}
          </div>

          {/* Name */}
          <div className="mb-[26px]">
            <label className="block mb-2 text-white text-xs font-normal">
              Name <span className="text-[#CC0000]">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) validateField('name', e.target.value);
              }}
              onBlur={(e) => validateField('name', e.target.value)}
              placeholder="John"
              className={`w-full h-[45px] px-5 rounded-[27px] border bg-white/5 backdrop-blur-[15px] text-white text-[13px] font-medium placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                errors.name ? 'border-red-500' : 'border-white/30'
              }`}
            />
            {errors.name && (
              <div className="mt-1 flex items-center gap-1">
                <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-red-500 text-xs">{errors.name}</p>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="mb-[26px]">
            <label className="block mb-2 text-white text-xs font-normal">
              Email <span className="text-[#CC0000]">*</span>
            </label>
            <input
              type="text"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) validateField('email', e.target.value);
              }}
              onBlur={(e) => validateField('email', e.target.value)}
              placeholder="johnblack@gmail.com"
              className={`w-full h-[45px] px-5 rounded-[27px] border bg-white/5 backdrop-blur-[15px] text-white text-[13px] font-medium placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                errors.email ? 'border-red-500' : 'border-white/30'
              }`}
            />
            {errors.email && (
              <div className="mt-1 flex items-center gap-1">
                <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-red-500 text-xs">{errors.email}</p>
              </div>
            )}
          </div>

          {/* Telegram */}
          <div className="mb-[26px]">
            <label className="block mb-2 text-white text-xs font-normal">
              Telegram <span className="text-[#CC0000]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white text-[13px] font-medium z-10">
                @
              </span>
              <input
                type="text"
                value={formData.telegram}
                onChange={(e) => {
                  setFormData({ ...formData, telegram: e.target.value });
                  if (errors.telegram) validateField('telegram', e.target.value);
                }}
                onBlur={(e) => validateField('telegram', e.target.value)}
                placeholder="johnblack"
                className={`w-full h-[45px] pl-9 pr-5 rounded-[27px] border bg-white/5 backdrop-blur-[15px] text-white text-[13px] font-medium placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                  errors.telegram ? 'border-red-500' : 'border-white/30'
                }`}
              />
            </div>
            {errors.telegram && (
              <div className="mt-1 flex items-center gap-1">
                <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-red-500 text-xs">{errors.telegram}</p>
              </div>
            )}
          </div>

          {/* Age */}
          <div className="mb-[26px]">
            <label className="block mb-2 text-white text-xs font-normal">
              Your Age <span className="text-[#CC0000]">*</span>
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => {
                setFormData({ ...formData, age: e.target.value });
                if (errors.age) validateField('age', e.target.value);
              }}
              onBlur={(e) => validateField('age', e.target.value)}
              placeholder="28"
              min={18}
              max={99}
              className={`w-full h-[45px] px-5 rounded-[27px] border bg-white/5 backdrop-blur-[15px] text-white text-[13px] font-medium placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                errors.age ? 'border-red-500' : 'border-white/30'
              }`}
            />
            {errors.age && (
              <div className="mt-1 flex items-center gap-1">
                <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-red-500 text-xs">{errors.age}</p>
              </div>
            )}
          </div>

          {/* Languages */}
          <div className="mb-[75px]">
            <label className="block mb-4 text-white text-xs font-normal">
              Language(s) I speak
            </label>
            <div className={`flex gap-6 w-full ${errors.languagesISpeak ? 'mb-1' : ''}`}>
              {LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  type="button"
                  onClick={() => handleLanguageToggle(language.code)}
                  className={`flex-1 h-[45px] px-4 rounded-[27px] border text-[13px] font-normal transition-all backdrop-blur-[15px] ${
                    formData.languagesISpeak.includes(language.code)
                      ? 'border-white bg-white/20 text-white'
                      : errors.languagesISpeak
                      ? 'border-red-500 bg-white/5 text-white hover:bg-white/10'
                      : 'border-white/30 bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  {language.code}
                </button>
              ))}
            </div>
            {errors.languagesISpeak && (
              <div className="mt-1 flex items-center gap-1">
                <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-red-500 text-xs">{errors.languagesISpeak}</p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full h-[45px] rounded-[30px] border text-[15px] font-medium transition-all ${
              submitting
                ? 'border-white/30 bg-white/35 text-black/50 cursor-not-allowed'
                : 'border-white/30 bg-white text-black hover:bg-white/90'
            } backdrop-blur-[15px]`}
          >
            {submitting ? 'SUBMITTING...' : 'SUBMIT'}
          </button>
        </form>
      </div>
    </div>
  );
}

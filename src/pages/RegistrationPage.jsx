import Header from '../components/Header'
import RegistrationForm from '../components/RegistrationForm'

function RegistrationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-purple-900 to-purple-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[length:20px_20px] opacity-40"></div>
      <div className="relative z-10">
        <Header />
        <RegistrationForm />
      </div>
    </div>
  )
}

export default RegistrationPage


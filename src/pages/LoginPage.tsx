import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'
import { IconScissors } from '../components/Icons'
import { extractError, useToast } from '../components/Toast'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [telefone, setTelefone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(telefone, password)
      toast.success(`Bem-vindo de volta!`)
      navigate('/')
    } catch (err) {
      toast.error(extractError(err, 'Não foi possível entrar'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-transparent to-zinc-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.15),transparent_50%)]" />

      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-brand-600 flex items-center justify-center mb-3 shadow-lg shadow-brand-900/50">
            <IconScissors className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">CORTE BRABO</h1>
          <p className="text-zinc-400 text-sm mt-1">Painel de gestão</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-1">Entrar</h2>
          <p className="text-sm text-zinc-400 mb-6">Acesso restrito a funcionários</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label">Telefone</label>
              <input
                type="tel"
                className="input"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value.replace(/\D/g, ''))}
                placeholder="11999999999"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="label">Senha</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg">
              Entrar
            </Button>
          </form>

          <p className="text-center text-zinc-500 text-xs mt-6">
            Não consegue entrar? Procure o administrador da barbearia.
          </p>
        </div>
      </div>
    </div>
  )
}

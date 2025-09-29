import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, LogIn, User, Loader2, Shield, AlertCircle, Settings, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster, toast } from 'react-hot-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useDarkMode } from '../context/DarkModeContext';

export default function LoginForm({ onSubmit, loading, error, title = "Connexion" }) {
  const { setTheme, getCurrentTheme } = useDarkMode();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const themes = [
    { id: 'light', label: 'Clair', icon: Sun },
    { id: 'dark', label: 'Sombre', icon: Moon },
    { id: 'system', label: 'Système', icon: Monitor }
  ];

  // Validation
  useEffect(() => {
    const errors = {};
    if (!formData.username) errors.username = 'Nom d’utilisateur requis';
    if (!formData.password) errors.password = 'Mot de passe requis';
    else if (formData.password.length < 6) errors.password = 'Minimum 6 caractères';
    setFieldErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  }, [formData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }
    onSubmit({ username: formData.username, password: formData.password });
  };

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const currentTheme = themes.find(t => t.id === getCurrentTheme());
  const CurrentThemeIcon = currentTheme?.icon || Sun;

  return (
    <>
      <Toaster position="top-center" toastOptions={{ className: 'dark:bg-gray-800 dark:text-white', duration: 4000 }} />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500" />
            <CardHeader className="space-y-4 text-center pb-6">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold">{title}</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">Accédez à votre espace</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Thème */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border">
                <div className="flex items-center gap-2"><Settings className="w-4 h-4" /> Apparence</div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm"><CurrentThemeIcon className="w-4 h-4 mr-2" /> {currentTheme?.label}</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {themes.map(t => (
                      <DropdownMenuItem key={t.id} onClick={() => setTheme(t.id)}>
                        <t.icon className="w-4 h-4 mr-2" /> {t.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="flex gap-2 items-center"><User className="w-4 h-4" /> Nom d’utilisateur</Label>
                <Input id="username" type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} disabled={loading} />
                <AnimatePresence>
                  {fieldErrors.username && <motion.div className="text-red-500 text-xs flex gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.username}</motion.div>}
                </AnimatePresence>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex gap-2 items-center">Mot de passe</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} disabled={loading} />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <AnimatePresence>
                  {fieldErrors.password && <motion.div className="text-red-500 text-xs flex gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.password}</motion.div>}
                </AnimatePresence>
              </div>

              {/* Submit */}
              <Button onClick={handleSubmit} disabled={loading || !isFormValid} className="w-full h-12">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Connexion...</> : <><LogIn className="w-4 h-4" /> Se connecter</>}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}

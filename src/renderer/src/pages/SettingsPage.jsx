import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Lock, 
  User, 
  Palette, 
  Activity,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  CheckCircle,
  LogOut,
  Moon,
  Sun,
  Database,
  Download,
  Upload,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import settingsService from '../services/settingService';
import { useDarkMode } from '@/context/DarkModeContext';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [user, setUser] = useState({ name: '', email: '', theme: 'light', loginType: 'email' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState({
    password: false,
    profile: false,
    logs: false,
    backup: false
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [theme, setTheme] = useState('light');
  const { darkMode, setTheme: setAppTheme, getCurrentTheme } = useDarkMode();
  const [loginType, setLoginType] = useState(settingsService.getLoginType());

  useEffect(() => {
    loadUserData();
    loadUserLogs();
    setTheme(getCurrentTheme());
  }, [getCurrentTheme]);

  const loadUserData = () => {
    const userData = {
      name: 'Utilisateur',
      email: 'user@paintms.com',
      theme: settingsService.getTheme(),
      loginType: settingsService.getLoginType()
    };
    setUser(userData);
    setProfileData({ name: userData.name, email: userData.email });
  };

  const loadUserLogs = async () => {
    try {
      setLoading(prev => ({ ...prev, logs: true }));
      const response = await settingsService.getUserLogs(20, 0);
      setLogs(response.logs || []);
    } catch (error) {
      console.error('Error loading logs:', error);
      setLogs([
        { id: 1, action: 'LOGIN_SUCCESS', details: '{"email":"user@paintms.com"}', createdAt: new Date().toISOString() },
        { id: 2, action: 'PROFILE_UPDATED', details: '{"email":"user@paintms.com"}', createdAt: new Date(Date.now() - 86400000).toISOString() },
        { id: 3, action: 'PASSWORD_CHANGED', details: '{}', createdAt: new Date(Date.now() - 172800000).toISOString() },
      ]);
    } finally {
      setLoading(prev => ({ ...prev, logs: false }));
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage('error', 'Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, password: true }));
      await settingsService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showMessage('success', 'Mot de passe modifié avec succès');
      loadUserLogs();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(prev => ({ ...prev, password: false }));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(prev => ({ ...prev, profile: true }));
      const response = await settingsService.updateProfile(profileData);
      setUser(prev => ({ ...prev, ...response.user }));
      showMessage('success', 'Profil mis à jour avec succès');
      loadUserLogs();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setAppTheme(newTheme);
    setUser(prev => ({ ...prev, theme: newTheme }));
    const themeLabel = newTheme === 'dark' ? 'sombre' : newTheme === 'light' ? 'clair' : 'système';
    showMessage('success', `Thème ${themeLabel} appliqué`);
  };

  const handleLoginTypeChange = (newLoginType) => {
    setLoginType(newLoginType);
    settingsService.setLoginType(newLoginType);
    setUser(prev => ({ ...prev, loginType: newLoginType }));
    showMessage('success', `Type de connexion changé vers ${newLoginType === 'email' ? 'Email' : 'Nom d\'utilisateur'}`);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Database Backup/Restore handlers
  const handleBackup = async () => {
    setLoading(prev => ({ ...prev, backup: true }));
    try {
      const result = await window.api.backupDatabase();
      
      if (result.success) {
        toast.success('Sauvegarde créée avec succès!');
      } else if (result.canceled) {
        toast.info('Sauvegarde annulée');
      } else {
        toast.error(`Erreur: ${result.error}`);
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, backup: false }));
    }
  };

  const handleRestore = async () => {
    setLoading(prev => ({ ...prev, backup: true }));
    try {
      const result = await window.api.restoreDatabase();
      
      if (result.success) {
        toast.success('Base de données restaurée!');
      } else if (result.canceled) {
        toast.info('Restauration annulée');
      } else {
        toast.error(`Erreur: ${result.error}`);
      }
    } catch (error) {
      toast.error('Erreur lors de la restauration');
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, backup: false }));
    }
  };

  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'LOGIN_SUCCESS': return 'default';
      case 'PASSWORD_CHANGED': return 'destructive';
      case 'PROFILE_UPDATED': return 'secondary';
      default: return 'outline';
    }
  };

  const formatActionText = (action) => {
    const actions = {
      'LOGIN_SUCCESS': 'Connexion réussie',
      'LOGIN_ATTEMPT': 'Tentative de connexion',
      'PASSWORD_CHANGED': 'Mot de passe modifié',
      'PROFILE_UPDATED': 'Profil mis à jour'
    };
    return actions[action] || action;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6 max-w-4xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Paramètres</h1>
      </div>

      {message.text && (
        <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
          {message.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Apparence
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Sauvegarde
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Activité
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informations du profil</CardTitle>
              <CardDescription>
                Gérez vos informations personnelles et préférences de connexion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2" htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Votre nom complet"
                    />
                  </div>
                  <div>
                    <Label className="mb-2" htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2">Type de connexion préféré</Label>
                  <Select value={loginType} onValueChange={handleLoginTypeChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="username">Nom d'utilisateur</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choisissez comment vous souhaitez vous connecter à l'application
                  </p>
                </div>

                <Button type="submit" disabled={loading.profile} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {loading.profile ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Changer le mot de passe</CardTitle>
              <CardDescription>
                Assurez-vous d'utiliser un mot de passe fort et unique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword" className="mb-2">Mot de passe actuel</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Votre mot de passe actuel"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => togglePasswordVisibility('current')}
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="mb-2" htmlFor="newPassword">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Votre nouveau mot de passe"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="mb-2" htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirmer le nouveau mot de passe"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Conseils pour un mot de passe fort :</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Au moins 8 caractères</li>
                    <li>• Mélange de lettres majuscules et minuscules</li>
                    <li>• Inclure des chiffres et des caractères spéciaux</li>
                    <li>• Éviter les informations personnelles</li>
                  </ul>
                </div>

                <Button type="submit" disabled={loading.password} className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {loading.password ? 'Modification...' : 'Changer le mot de passe'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Préférences d'apparence</CardTitle>
              <CardDescription>
                Personnalisez l'apparence de l'application selon vos préférences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Thème de l'application</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Choisissez votre préférence de thème
                </p>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        Clair
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        Sombre
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Système
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-medium">Langue de l'interface</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Sélectionnez la langue d'affichage de l'application
                </p>
                <Select value="fr" onValueChange={() => showMessage('info', 'Fonctionnalité bientôt disponible')}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en" disabled>English (Bientôt)</SelectItem>
                    <SelectItem value="ar" disabled>العربية (Bientôt)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Tab - NEW */}
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Sauvegarde et Restauration</CardTitle>
              <CardDescription>
                Gérez les sauvegardes de votre base de données
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <Database className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Sauvegarder la base de données</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Créez une copie de sauvegarde de toutes vos données (clients, produits, factures)
                  </p>
                  <Button 
                    onClick={handleBackup}
                    disabled={loading.backup}
                    className="gap-2"
                    variant="outline"
                  >
                    <Download className="w-4 h-4" />
                    {loading.backup ? 'Sauvegarde...' : 'Sauvegarder maintenant'}
                  </Button>
                </div>
              </div>
              
              <div className="border-t pt-6 flex items-start gap-4">
                <Upload className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Restaurer la base de données</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Restaurez une sauvegarde précédente. <strong>Attention:</strong> cela remplacera toutes les données actuelles.
                  </p>
                  <Button 
                    onClick={handleRestore}
                    disabled={loading.backup}
                    variant="destructive"
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {loading.backup ? 'Restauration...' : 'Restaurer depuis un fichier'}
                  </Button>
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      Conseils de sauvegarde
                    </h4>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                      <li>• Créez des sauvegardes régulières (au moins une fois par semaine)</li>
                      <li>• Stockez les sauvegardes dans un endroit sûr (disque externe, cloud)</li>
                      <li>• Testez vos sauvegardes occasionnellement</li>
                      <li>• Avant toute restauration, une sauvegarde automatique est créée</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Historique d'activité</CardTitle>
              <CardDescription>
                Consultez l'historique de vos actions sur l'application
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.logs ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Activity className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Chargement des logs...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Aucun historique d'activité disponible</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {logs.map((log, index) => (
                        <div key={log.id || index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              {log.action === 'LOGIN_SUCCESS' && <LogOut className="w-5 h-5 text-green-600 rotate-180" />}
                              {log.action === 'PASSWORD_CHANGED' && <Lock className="w-5 h-5 text-red-600" />}
                              {log.action === 'PROFILE_UPDATED' && <User className="w-5 h-5 text-blue-600" />}
                              {!['LOGIN_SUCCESS', 'PASSWORD_CHANGED', 'PROFILE_UPDATED'].includes(log.action) && 
                                <Activity className="w-5 h-5 text-gray-600" />}
                            </div>
                            <div>
                              <p className="font-medium">{formatActionText(log.action)}</p>
                              {log.details && (
                                <p className="text-sm text-muted-foreground">
                                  {(() => {
                                    try {
                                      const details = JSON.parse(log.details);
                                      if (details.email) return `Email: ${details.email}`;
                                      if (details.reason) return `Raison: ${details.reason}`;
                                      return '';
                                    } catch {
                                      return '';
                                    }
                                  })()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={getActionBadgeColor(log.action)}>
                              {formatActionText(log.action)}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(log.createdAt).toLocaleString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-center pt-4">
                    <Button 
                      variant="outline" 
                      onClick={loadUserLogs}
                      disabled={loading.logs}
                    >
                      {loading.logs ? 'Chargement...' : 'Actualiser'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
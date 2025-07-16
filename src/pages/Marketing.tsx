
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Radio, Calendar, Users, BarChart3, Upload, Shield, Zap, Clock, Globe, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Marketing = () => {
  const features = [
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Grille de programmation intelligente",
      description: "Créez et gérez votre grille de programmes avec une interface intuitive et moderne."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Gestion des animateurs",
      description: "Organisez votre équipe d'animateurs avec des profils détaillés et des assignations automatiques."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Statistiques détaillées",
      description: "Analysez vos programmes avec des rapports complets et des métriques en temps réel."
    },
    {
      icon: <Upload className="h-6 w-6" />,
      title: "Import Excel/CSV",
      description: "Importez votre programmation existante en quelques clics depuis vos fichiers Excel ou CSV."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Sécurité avancée",
      description: "Vos données sont protégées avec un système d'authentification sécurisé et des sauvegardes automatiques."
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Accès multi-plateforme",
      description: "Accédez à votre grille depuis n'importe quel appareil, n'importe où, n'importe quand."
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: "29€",
      period: "/mois",
      description: "Parfait pour les petites radios locales",
      features: [
        "1 utilisateur",
        "Jusqu'à 50 programmes",
        "Grille de programmation basique",
        "Support email"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "79€",
      period: "/mois",
      description: "Idéal pour les radios en croissance",
      features: [
        "5 utilisateurs",
        "Programmes illimités",
        "Gestion des animateurs",
        "Statistiques avancées",
        "Import Excel/CSV",
        "Support prioritaire"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "199€",
      period: "/mois",
      description: "Pour les réseaux radio et grandes stations",
      features: [
        "Utilisateurs illimités",
        "Multi-stations",
        "API personnalisée",
        "Intégrations tierces",
        "Support téléphonique 24/7",
        "Formation personnalisée"
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Marie Dubois",
      role: "Directrice de Radio Soleil",
      content: "Radio Programmer a révolutionné notre façon de gérer la programmation. Nous avons gagné 5 heures par semaine !",
      rating: 5
    },
    {
      name: "Jean-Pierre Martin",
      role: "Gérant de FM Plus",
      content: "L'interface est intuitive et les fonctionnalités d'import nous ont fait économiser des heures de saisie manuelle.",
      rating: 5
    },
    {
      name: "Sophie Leroy",
      role: "Responsable programmes - Radio Évasion",
      content: "Enfin un outil pensé pour les professionnels de la radio. Je le recommande vivement !",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Radio className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Radio Programmer</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link to="/">
              <Button>Commencer</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            <Zap className="h-4 w-4 mr-1" />
            Révolutionnez votre programmation radio
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            La solution complète pour gérer votre grille radio
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Créez, organisez et diffusez votre programmation radio avec une plateforme moderne, 
            intuitive et conçue spécialement pour les professionnels de la radio.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                Essayer gratuitement
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Voir la démo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Fonctionnalités puissantes</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez tous les outils dont vous avez besoin pour gérer efficacement votre station radio
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Tarifs transparents</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choisissez le plan qui correspond à vos besoins. Tous les plans incluent un essai gratuit de 14 jours.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative hover:shadow-lg transition-shadow ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                  Plus populaire
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  {plan.price}<span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full mt-6 ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  Commencer l'essai gratuit
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Ce que disent nos clients</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez pourquoi plus de 500 stations radio nous font confiance
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-primary to-accent text-white">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à révolutionner votre programmation radio ?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Rejoignez des centaines de stations radio qui ont déjà fait le choix de l'innovation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button size="lg" variant="secondary">
                  Essai gratuit 14 jours
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
                Planifier une démo
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Radio className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Radio Programmer</span>
          </div>
          <div className="text-center text-muted-foreground">
            <p>© 2024 Radio Programmer - Fièrement conçu par{' '}
              <a 
                href="https://oredytech.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:text-accent transition-colors"
              >
                Oredy TECHNOLOGIES
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Marketing;

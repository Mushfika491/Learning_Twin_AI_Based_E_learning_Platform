import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Brain, LineChart, Users, Sparkles, GraduationCap, Target } from "lucide-react";
import { motion } from "framer-motion";
import heroBanner from "@/assets/hero-banner.jpg";

const Index = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Personalized course recommendations powered by advanced AI",
    },
    {
      icon: LineChart,
      title: "Progress Analytics",
      description: "Track your learning journey with detailed insights and metrics",
    },
    {
      icon: Users,
      title: "Expert Instructors",
      description: "Learn from industry professionals and subject matter experts",
    },
    {
      icon: Sparkles,
      title: "Interactive Content",
      description: "Engage with dynamic learning materials and real-time feedback",
    },
    {
      icon: Target,
      title: "Goal-Oriented",
      description: "Set and achieve your learning goals with guided pathways",
    },
    {
      icon: GraduationCap,
      title: "Certified Learning",
      description: "Earn recognized certificates upon course completion",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-10" />
        <div className="container relative py-24 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Transform Your Learning with{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  AI-Powered Education
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Experience personalized learning paths, real-time analytics, and intelligent
                recommendations designed to accelerate your educational journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-primary text-lg" asChild>
                  <Link to="/register">Start Learning Free</Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={heroBanner}
                  alt="Learning Twin Platform"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-primary opacity-20" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Learning Twin?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cutting-edge features designed to make learning efficient, engaging, and effective
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="pt-6">
                    <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl bg-gradient-primary p-12 md:p-16 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-grid-white/10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
                Join thousands of learners who are already transforming their careers with Learning Twin
              </p>
              <Button size="lg" variant="secondary" className="text-lg" asChild>
                <Link to="/register">Create Free Account</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">Learning Twin</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Learning Twin. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Database, Bot, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Intelligent{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                Scraping Studio
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              A comprehensive platform combining intelligent web scraping with
              an AI chat interface, featuring real-time data visualization and
              customizable AI responses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/app">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#features">Learn More</a>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16 w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl border bg-card"
          >
            <img
              src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80"
              alt="Scraping Studio Dashboard"
              className="w-full h-auto"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our platform offers a comprehensive suite of tools to help you
            extract, analyze, and leverage web data effectively.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Globe className="h-10 w-10" />}
            title="Interactive Scraping Studio"
            description="Embedded browser preview with click-to-select elements and live visualization of scraping progress."
          />
          <FeatureCard
            icon={<Bot className="h-10 w-10" />}
            title="AI Chat Interface"
            description="Context-aware AI responses with animated typing effects and smart formatting."
          />
          <FeatureCard
            icon={<Database className="h-10 w-10" />}
            title="Data Dashboard"
            description="Interactive charts, filterable tables, and real-time scraping insights."
          />
          <FeatureCard
            icon={<Code className="h-10 w-10" />}
            title="Model Management"
            description="Configure AI models, customize prompts, and adjust response formatting."
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform simplifies the process of extracting and analyzing
              web data through an intuitive workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <WorkflowStep
              number="01"
              title="Configure Scraping"
              description="Enter a URL, select elements to scrape, and configure scraping parameters."
            />
            <WorkflowStep
              number="02"
              title="Extract Data"
              description="Run the scraping process and watch as data is extracted in real-time."
            />
            <WorkflowStep
              number="03"
              title="Analyze & Chat"
              description="Visualize the extracted data and interact with it through the AI chat interface."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-card border rounded-xl p-8 md:p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Data Workflow?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start extracting, analyzing, and leveraging web data with our
            intelligent scraping platform today.
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link to="/app">
              Get Started Now <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">Intelligent Scraping Studio</h3>
              <p className="text-muted-foreground">
                © 2023 All rights reserved
              </p>
            </div>
            <div className="flex gap-8">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-card border rounded-xl p-6 flex flex-col items-center text-center"
    >
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
};

const WorkflowStep = ({ number, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default LandingPage;

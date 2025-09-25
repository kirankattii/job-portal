import React from 'react'
import { Users, Target, Zap, Shield, Heart, Award } from 'lucide-react'

const About = () => {
  const features = [
    {
      icon: <Users className="w-8 h-8 text-primary-600" />,
      title: "Smart Matching",
      description: "Our AI-powered algorithm matches candidates with the perfect job opportunities based on skills, experience, and preferences."
    },
    {
      icon: <Target className="w-8 h-8 text-primary-600" />,
      title: "Targeted Recruitment",
      description: "Recruiters can find the right talent quickly with advanced filtering and candidate recommendation systems."
    },
    {
      icon: <Zap className="w-8 h-8 text-primary-600" />,
      title: "Fast & Efficient",
      description: "Streamlined application processes and automated workflows save time for both job seekers and employers."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-600" />,
      title: "Secure & Reliable",
      description: "Your data is protected with enterprise-grade security measures and privacy controls."
    }
  ]

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "5K+", label: "Job Postings" },
    { number: "50+", label: "Companies" },
    { number: "98%", label: "Success Rate" }
  ]

  const team = [
    {
      name: "Our Mission",
      description: "To revolutionize the job market by connecting talented individuals with their dream careers through innovative technology and personalized experiences."
    },
    {
      name: "Our Vision",
      description: "To become the leading platform that transforms how people find jobs and companies discover talent, making career success accessible to everyone."
    },
    {
      name: "Our Values",
      description: "We believe in transparency, fairness, and creating meaningful connections that benefit both job seekers and employers."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About JobPortal
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
              Connecting talent with opportunity through innovative technology and personalized experiences
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Who We Are
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              JobPortal is more than just a job board – we're a comprehensive platform that transforms the recruitment experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mr-4">
                    <Heart className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {item.name}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose JobPortal?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We provide cutting-edge tools and features that make job searching and hiring more efficient and effective.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers and employers who have found success with JobPortal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/register"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started Free
            </a>
            <a
              href="/jobs"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              Browse Jobs
            </a>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <section className="py-12 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                JobPortal
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              © 2024 JobPortal. All rights reserved. Built with ❤️ for the future of work.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About


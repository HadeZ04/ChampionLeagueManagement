import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Monitor, Smartphone, Zap, Palette, Code, Globe } from 'lucide-react'
import Tilt from 'react-parallax-tilt'

const Services = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const services = [
    {
      icon: Monitor,
      title: 'Web Design',
      description: 'Creating stunning, user-friendly websites that captivate and convert visitors into customers.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Smartphone,
      title: 'Mobile Development',
      description: 'Building responsive mobile applications that provide seamless experiences across all devices.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Zap,
      title: 'Performance Optimization',
      description: 'Optimizing websites for lightning-fast loading speeds and superior user experience.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Palette,
      title: 'UI/UX Design',
      description: 'Designing intuitive interfaces that delight users and drive engagement.',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: Code,
      title: 'Frontend Development',
      description: 'Developing modern, interactive frontends using the latest technologies and frameworks.',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: Globe,
      title: 'SEO Optimization',
      description: 'Implementing SEO best practices to improve search engine rankings and visibility.',
      color: 'from-indigo-500 to-purple-500'
    }
  ]

  return (
    <section id="services" className="py-20 relative">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold gradient-text mb-6">Services</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            I offer a comprehensive range of digital services to help bring your vision to life
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10}>
                <motion.div
                  whileHover={{ y: -10 }}
                  className="glass-effect rounded-2xl p-8 h-full cursor-hover group"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className="text-white" size={32} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-pink-400 transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed">
                    {service.description}
                  </p>

                  <motion.div
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    className={`h-1 bg-gradient-to-r ${service.color} mt-6 rounded-full transition-all duration-300`}
                  />
                </motion.div>
              </Tilt>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services

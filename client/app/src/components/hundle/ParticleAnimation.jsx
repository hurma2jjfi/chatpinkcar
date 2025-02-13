import React, { useRef, useEffect } from 'react';
import { useSpring } from 'react-spring';

const ParticleAnimation = ({ messageId }) => {
    const canvasRef = useRef(null);
    const [isAnimating, setIsAnimating] = React.useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let particles = [];
        const particleCount = 200; // Увеличено количество частиц

        // Установка размера холста
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Функция создания частиц
        const createParticles = () => {
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 2 + 1,
                    color: 'rgba(255, 255, 255, 1)',
                    velocity: {
                        x: (Math.random() - 0.5) * 4,
                        y: (Math.random() - 0.5) * 4,
                    },
                    opacity: Math.random(), // Добавлено свойство opacity для плавного исчезновения
                });
            }
            setIsAnimating(true);
            animate();
            setTimeout(() => setIsAnimating(false), 3000); // Анимация длится примерно секунды и затем исчезает
        };

        // Анимация частиц
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle) => {
                particle.x += particle.velocity.x;
                particle.y += particle.velocity.y;

                if (!isAnimating && Math.abs(particle.opacity - .01) > Number.EPSILON) { 
                  particle.opacity -= .01; 
                  if (particle.opacity < .01)
                      particle.opacity=.01;
              }

                // Проверка выхода за границы и отражение от краев
                if (particle.x + particle.radius > canvas.width || particle.x - particle.radius < 0) {
                    particle.velocity.x *= -1;
                }
                if (particle.y + particle.radius > canvas.height || particle.y - particle.radius < 0) {
                    particle.velocity.y *= -1;
                }

                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                
               ctx.fillStyle=`rgba(255 ,255 ,255 ,${particle.opacity})`; 
               ctx.fill();
           });

           requestAnimationFrame(animate);
       }

       createParticles();

       return () => {};
   }, [messageId]);

   return (
     <div style={{
         position:'absolute',
         top:'50%',
         left:'50%',
         transform:'translate(-50%,-50%)',
         width:`${window.innerWidth}px`,
         height:`${window.innerHeight}px`
     }}>
          {/* Фон для затемнения */}
          {isAnimating && (
             <div style={{
                 position:"fixed",
                 top:"0px",
                 left:"0px",
                 width:`${window.innerWidth}px`,
                 height:`${window.innerHeight}px`,
                 backgroundColor:'rgba(000 ,000 ,000 ,.6)',
             }} />
           )}
           {/* Холст */}
           <canvas ref={canvasRef} style={{ pointerEvents:'none' }} />
     </div>
 );
};

export default ParticleAnimation;

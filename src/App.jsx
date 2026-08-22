import { useEffect, useMemo } from 'react';
import template from './site-template.html?raw';

const screens = {
  financeiro: ['VISÃO FINANCEIRA','Controle para decidir melhor.','R$ 482.560','A receber','R$ 84.687','1.284','Fluxo de caixa'],
  comercial: ['GESTÃO COMERCIAL','Venda mais. Enxergue antes.','R$ 245.780','Pedidos','352','1.230','Faturamento por período'],
  estoque: ['GESTÃO DE ESTOQUE','O produto certo, no lugar certo.','8.642 itens','Reservas','326','1.428','Movimentação de estoque'],
  serviços: ['OPERAÇÃO DE SERVIÇOS','Prazos, pessoas e entregas.','64 OS','Clientes ativos','128','18','Execução de projetos'],
  fiscal: ['GESTÃO FISCAL','Segurança para seguir em frente.','184 NF-e','Documentos','2.540','98,6%','Emissões por período']
};

function useZurveInteractions() {
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups = [];
    document.querySelectorAll('.hero .reveal').forEach(el => el.classList.add('visible'));
    if (location.hash) requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView());

    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
    }), { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
    cleanups.push(() => revealObserver.disconnect());

    const menu = document.querySelector('.menu');
    const toggleMenu = () => {
      const open = document.querySelector('.header')?.classList.toggle('open');
      menu?.setAttribute('aria-expanded', String(open));
    };
    menu?.addEventListener('click', toggleMenu);
    cleanups.push(() => menu?.removeEventListener('click', toggleMenu));

    const scene = document.querySelector('#productScene');
    const moveScene = event => {
      const rect = scene.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      scene.querySelectorAll('[data-depth]').forEach(item => {
        const depth = Number(item.dataset.depth);
        item.style.translate = `${x * 13 * depth}px ${y * 10 * depth}px`;
      });
    };
    const resetScene = () => scene?.querySelectorAll('[data-depth]').forEach(item => item.style.translate = '0 0');
    if (!reduced && matchMedia('(pointer:fine)').matches) {
      scene?.addEventListener('mousemove', moveScene);
      scene?.addEventListener('mouseleave', resetScene);
      cleanups.push(() => { scene?.removeEventListener('mousemove', moveScene); scene?.removeEventListener('mouseleave', resetScene); });
    }

    const fields = ['screenKicker','screenTitle','metricOne','metricLabel','metricTwo','metricThree','chartLabel'].map(id => document.getElementById(id));
    const screenName = document.getElementById('screenName');
    const stepObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll('.experience-step').forEach(step => step.classList.toggle('active', step === entry.target));
      const key = entry.target.dataset.screen;
      const values = screens[key];
      if (screenName) screenName.textContent = key.charAt(0).toUpperCase() + key.slice(1);
      fields.forEach((field, index) => {
        if (!field) return;
        field.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}], {duration:350});
        field.textContent = values[index];
      });
    }), { rootMargin: '-35% 0px -45% 0px', threshold: 0 });
    document.querySelectorAll('.experience-step').forEach(step => stepObserver.observe(step));
    cleanups.push(() => stepObserver.disconnect());

    let ticking = false;
    const parallax = () => {
      if (!ticking) requestAnimationFrame(() => {
        document.querySelectorAll('[data-parallax]').forEach(el => { el.style.transform = `translate3d(0,${scrollY * Number(el.dataset.parallax)}px,0)`; });
        ticking = false;
      });
      ticking = true;
    };
    if (!reduced) { addEventListener('scroll', parallax, { passive:true }); cleanups.push(() => removeEventListener('scroll', parallax)); }
    return () => cleanups.forEach(cleanup => cleanup());
  }, []);
}

function App() {
  useZurveInteractions();
  const content = useMemo(() => {
    const doc = new DOMParser().parseFromString(template, 'text/html');
    doc.querySelectorAll('script, link[rel="stylesheet"]').forEach(el => el.remove());
    doc.querySelector('.hero-legacy')?.remove();
    return doc.body.innerHTML;
  }, []);
  return <div className="zurveerp-app" dangerouslySetInnerHTML={{ __html: content }} />;
}

export default App;

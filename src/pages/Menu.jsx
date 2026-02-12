import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import CartModal from '../components/CartModal';
import { Search, ChevronLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import logo from '../assets/logo.png'; 

const Menu = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

  // Carga de datos
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('order', { ascending: true });

        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true });

        setCategories(categoriesData || []);
        setProducts(productsData || []);

        // Establecer categoría inicial
        const hasSpecial = (productsData || []).some(p => p.is_special);
        if (hasSpecial) setActiveCategory('special');
        else if (categoriesData?.length > 0) setActiveCategory(categoriesData[0].id);
        
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Función para scroll manual (Click en Navbar)
  const scrollToCategory = (id) => {
    setActiveCategory(id);
    const element = document.getElementById(`section-${id}`);
    if (element) {
      // Offset de 160px para compensar el header sticky
      const headerOffset = 160; 
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  // Lógica de "Scroll Spy" (Detectar sección al bajar)
  useEffect(() => {
    if (loading) return;

    const handleScroll = () => {
      // AQUÍ ESTÁ EL ARREGLO: Aumenté el offset a 220px
      // Esto compensa la altura del nuevo header + un margen para que cambie antes
      const scrollPosition = window.scrollY + 220;
      
      const specialSection = document.getElementById('section-special');
      
      // 1. Verificar Sección Especial
      if (specialSection) {
        const top = specialSection.offsetTop;
        const height = specialSection.offsetHeight;
        if (scrollPosition >= top && scrollPosition < top + height) {
          setActiveCategory('special');
          return; 
        }
      }

      // 2. Verificar Categorías Normales
      for (const cat of categories) {
        const element = document.getElementById(`section-${cat.id}`);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveCategory(cat.id);
            break; // Rompemos el ciclo apenas encontramos la activa
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories, products, loading]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Loader2 size={40} className="animate-spin" color="var(--accent-primary)" />
      </div>
    );
  }

  const specialProducts = products.filter(p => p.is_special);

  return (
    <div className="page-wrapper">
      {/* Header Sticky */}
      <header className="navbar-sticky">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}>
            <ChevronLeft size={28} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={logo} alt="Oishi Logo" style={{ height: '38px', width: 'auto', borderRadius: '6px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
              <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700, color: 'white' }}>Oishi Sushi</h2>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 600 }}>Carta Digital</span>
            </div>
          </div>
          
          <div style={{ color: 'var(--text-secondary)' }}><Search size={24} /></div>
        </div>

        <Navbar 
          categories={[
            ...(specialProducts.length > 0 ? [{ id: 'special', name: '🔥 Solo por hoy' }] : []),
            ...categories
          ]} 
          activeCategory={activeCategory} 
          onCategoryClick={scrollToCategory} 
        />
      </header>

      <main className="container">
        {/* Sección Especial */}
        {specialProducts.length > 0 && (
          <section id="section-special" style={{ marginBottom: '40px', scrollMarginTop: '160px' }}>
            <h2 className="section-title text-gradient">🔥 Solo por hoy</h2>
            <div className="product-grid">
              {specialProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Categorías Dinámicas */}
        {categories.map((cat) => {
          const catProducts = products.filter(p => p.category_id === cat.id);
          if (catProducts.length === 0) return null;

          return (
            <section key={cat.id} id={`section-${cat.id}`} style={{ marginBottom: '40px', scrollMarginTop: '160px' }}>
              <h2 className="section-title">{cat.name}</h2>
              <div className="product-grid">
                {catProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <CartModal />
      <FloatingWhatsApp />
    </div>
  );
};

export default Menu;
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingBag, List, Settings, Plus, Edit, Trash, ArrowLeft, Loader2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductModal from '../components/ProductModal';
import CategoryModal from '../components/CategoryModal';
import { supabase } from '../lib/supabase';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);

  // Menú lateral
  const sidebarItems = [
    { id: 'products', label: 'Productos', icon: <ShoppingBag size={20} /> },
    { id: 'categories', label: 'Categorías', icon: <List size={20} /> },
    { id: 'settings', label: 'Ajustes', icon: <Settings size={20} /> },
  ];

  // Carga inicial de datos
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: cats } = await supabase.from('categories').select('*').order('order');
        const { data: prods } = await supabase.from('products').select('*').order('name');
        
        setCategories(cats || []);
        setProducts(prods || []);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- LÓGICA DE PRODUCTOS ---
  const handleSaveProduct = async (formData) => {
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseInt(formData.price),
        category_id: formData.category_id,
        image_url: formData.image_url,
        is_special: formData.is_special,
        is_active: true
      };

      let result;
      if (editingProduct) {
        const { data, error } = await supabase
          .from('products').update(payload).eq('id', editingProduct.id).select().single();
        if (error) throw error;
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? data : p));
      } else {
        const { data, error } = await supabase
          .from('products').insert(payload).select().single();
        if (error) throw error;
        setProducts(prev => [...prev, data]);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Desactivar este producto?')) return;
    try {
      await supabase.from('products').update({ is_active: false }).eq('id', id);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: false } : p));
    } catch (error) {
      console.error(error);
    }
  };

  // --- LÓGICA DE CATEGORÍAS ---
  const handleSaveCategory = async (formData) => {
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        order: parseInt(formData.order),
        is_active: formData.is_active
      };

      if (editingCategory) {
        const { data, error } = await supabase
          .from('categories').update(payload).eq('id', editingCategory.id).select().single();
        if (error) throw error;
        setCategories(prev => prev.map(c => c.id === editingCategory.id ? data : c).sort((a,b) => a.order - b.order));
      } else {
        const id = formData.name.toLowerCase().replace(/\s+/g, '-');
        const { data, error } = await supabase
          .from('categories').insert({ ...payload, id }).select().single();
        if (error) throw error;
        setCategories(prev => [...prev, data].sort((a,b) => a.order - b.order));
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return <div className="admin-layout" style={{justifyContent:'center', alignItems:'center'}}><Loader2 className="animate-spin" /></div>;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar glass">
        <div className="sidebar-brand">
          <div style={{ width: 32, height: 32, background: 'var(--accent-primary)', borderRadius: 8 }}></div>
          <h3>Oishi Admin</h3>
        </div>
        
        <nav style={{ flex: 1 }}>
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} className="nav-item" style={{ marginTop: 'auto', color: '#ff4444' }}>
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h2 className="section-title" style={{ margin: 0 }}>
              {activeTab === 'products' ? 'Gestión de Productos' : 
               activeTab === 'categories' ? 'Categorías del Menú' : 'Configuración'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {activeTab === 'products' ? `${products.length} items en total` : 'Organiza tu carta'}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate('/')} className="btn btn-secondary">Ver Carta</button>
            {activeTab === 'products' && (
              <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="btn btn-primary">
                <Plus size={18} /> Nuevo Producto
              </button>
            )}
            {activeTab === 'categories' && (
              <button onClick={() => { setEditingCategory(null); setIsCategoryModalOpen(true); }} className="btn btn-primary">
                <Plus size={18} /> Nueva Categoría
              </button>
            )}
          </div>
        </header>

        {/* Tabla de Productos */}
        {activeTab === 'products' && (
          <div className="glass table-container animate-fade">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{product.name}</div>
                      {product.is_special && <span style={{ fontSize: '0.7rem', color: 'var(--accent-secondary)' }}>🔥 Especial</span>}
                    </td>
                    <td>
                      {categories.find(c => c.id === product.category_id)?.name || '---'}
                    </td>
                    <td style={{ fontWeight: 700 }}>${product.price.toLocaleString('es-CL')}</td>
                    <td>
                      <span className={`badge ${product.is_active ? 'active' : 'inactive'}`}>
                        {product.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button onClick={() => { setEditingProduct(product); setIsModalOpen(true); }} className="btn-icon-sm">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="btn-icon-sm danger">
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tabla de Categorías */}
        {activeTab === 'categories' && (
          <div className="glass table-container animate-fade">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td><span style={{ fontWeight: 800, color: 'var(--text-muted)' }}>#{cat.order}</span></td>
                    <td style={{ fontWeight: 600 }}>{cat.name}</td>
                    <td>
                      <span className={`badge ${cat.is_active ? 'active' : 'inactive'}`}>
                        {cat.is_active ? 'Visible' : 'Oculta'}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button onClick={() => { setEditingCategory(cat); setIsCategoryModalOpen(true); }} className="btn-icon-sm">
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modales */}
      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveProduct}
        product={editingProduct}
        categories={categories}
        saving={saving}
      />
      <CategoryModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        category={editingCategory}
      />
    </div>
  );
};

export default Admin;
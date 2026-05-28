import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { Heart, ShoppingBag, Star, Share2, MessageCircle, AlertTriangle } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';

export const ProductDetails = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, inWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  // Related and Recently Viewed
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Load product details
  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        setActiveImage(data.images[0]);
        
        // Auto-select first in-stock size
        const firstInStock = data.sizes.find((s) => s.stock > 0);
        if (firstInStock) {
          setSelectedSize(firstInStock.size);
        }

        // Cache in recently viewed list (local storage)
        updateRecentlyViewed(data);

        // Fetch related products
        fetchRelated(data._id);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchRelated = async (productId) => {
    try {
      const res = await fetch(`/api/products/${productId}/related`);
      if (res.ok) {
        const data = await res.json();
        setRelatedProducts(data);
      }
    } catch (error) {
      console.error('Error loading related items:', error);
    }
  };

  const updateRecentlyViewed = (currentProd) => {
    const list = localStorage.getItem('adven_recent');
    let recentList = list ? JSON.parse(list) : [];
    
    // Filter out current product if already there
    recentList = recentList.filter((p) => p._id !== currentProd._id);
    
    // Add current product to top
    recentList.unshift({
      _id: currentProd._id,
      name: currentProd.name,
      price: currentProd.price,
      images: currentProd.images,
      category: currentProd.category,
      sizes: currentProd.sizes,
      featured: currentProd.featured,
      averageRating: currentProd.averageRating,
      numberOfReviews: currentProd.numberOfReviews
    });
    
    // Cap at 4 items
    recentList = recentList.slice(0, 4);
    
    localStorage.setItem('adven_recent', JSON.stringify(recentList));
    setRecentlyViewed(recentList.filter((p) => p._id !== currentProd._id));
  };

  // Load recently viewed on mount
  useEffect(() => {
    const list = localStorage.getItem('adven_recent');
    if (list && product) {
      const parsed = JSON.parse(list);
      setRecentlyViewed(parsed.filter((p) => p._id !== product._id));
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart(product, selectedSize, quantity);
  };

  // Review Form Submit Handler
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setReviewLoading(true);
    setReviewError('');
    setReviewSuccess(false);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment, productId: product._id }),
      });

      const data = await res.json();

      if (res.ok) {
        setReviewSuccess(true);
        setComment('');
        // Reload details to get updated ratings & reviews list
        fetchProductDetails();
      } else {
        setReviewError(data.message || 'Failed to submit review');
      }
    } catch (err) {
      setReviewError('Error connecting to the server');
    } finally {
      setReviewLoading(false);
    }
  };

  // WhatsApp sharing logic
  const handleWhatsAppShare = () => {
    const productUrl = window.location.href;
    const shareText = `Check out this premium ${product.name} at Adven for ₹${product.price}: ${productUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="loader"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <h2>Product not found</h2>
        <Link to="/shop" className="btn btn-secondary" style={{ marginTop: '20px' }}>Back to Shop</Link>
      </div>
    );
  }

  const selectedSizeStockObj = product.sizes.find((s) => s.size === selectedSize);
  const selectedSizeStock = selectedSizeStockObj ? selectedSizeStockObj.stock : 0;
  const isOutOfStock = product.sizes.reduce((acc, curr) => acc + curr.stock, 0) === 0;
  const isFavorite = inWishlist(product._id);

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '40px' }}>
      
      {/* Product Details Grid */}
      <div className="product-details-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '48px',
        marginBottom: '80px'
      }}>
        
        {/* Left Column: Image previews */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Main Image container */}
          <div style={{
            position: 'relative',
            paddingTop: '125%',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.03)',
            backgroundColor: '#0f0f13'
          }}>
            <img 
              src={activeImage} 
              alt={product.name} 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>

          {/* Thumbnail row */}
          {product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  style={{
                    width: '70px',
                    height: '85px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '2px solid',
                    borderColor: activeImage === img ? 'hsl(var(--primary))' : 'transparent',
                    backgroundColor: '#0f0f13'
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Garment Information & CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Category */}
          <span className="badge badge-gold" style={{ alignSelf: 'flex-start' }}>{product.category}</span>
          
          {/* Title */}
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', textTransform: 'uppercase', lineHeight: 1.1 }}>{product.name}</h1>
          
          {/* Ratings summary */}
          {product.averageRating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', color: '#ffb400' }}>
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={i < Math.round(product.averageRating) ? 'currentColor' : 'none'} 
                    stroke="currentColor" 
                  />
                ))}
              </div>
              <span style={{ fontWeight: 600 }}>{product.averageRating}</span>
              <span style={{ color: 'hsl(var(--text-muted))' }}>({product.numberOfReviews} reviews)</span>
            </div>
          )}

          {/* Price */}
          <span style={{
            fontSize: '1.8rem',
            fontWeight: 700,
            color: 'hsl(var(--primary))',
            fontFamily: 'var(--font-display)'
          }}>
            ₹{product.price.toLocaleString('en-IN')}
          </span>

          {/* Description */}
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.95rem', lineHeight: '1.7' }}>
            {product.description}
          </p>

          <hr style={{ borderColor: 'rgba(255,255,255,0.05)' }} />

          {/* Size Selector Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.85rem' }}>
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--text-secondary))' }}>Select Size:</span>
              <a href="#" style={{ color: 'hsl(var(--primary))', textDecoration: 'underline' }}>Size Guide</a>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {product.sizes.map((s) => {
                const outOfStock = s.stock === 0;
                const isSelected = selectedSize === s.size;
                return (
                  <button
                    key={s.size}
                    onClick={() => !outOfStock && setSelectedSize(s.size)}
                    disabled={outOfStock}
                    style={{
                      minWidth: '50px',
                      height: '50px',
                      padding: '0 12px',
                      border: '1px solid',
                      borderColor: isSelected 
                        ? 'hsl(var(--primary))' 
                        : outOfStock ? 'rgba(255,255,255,0.02)' : 'hsl(var(--border-color))',
                      backgroundColor: isSelected 
                        ? 'rgba(212,175,55,0.08)' 
                        : outOfStock ? 'transparent' : 'rgba(255,255,255,0.02)',
                      color: isSelected 
                        ? 'hsl(var(--primary))' 
                        : outOfStock ? 'hsl(var(--text-muted))' : 'hsl(var(--text-secondary))',
                      textDecoration: outOfStock ? 'line-through' : 'none',
                      opacity: outOfStock ? 0.3 : 1,
                      cursor: outOfStock ? 'not-allowed' : 'pointer',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: isSelected ? 600 : 400
                    }}
                  >
                    {s.size}
                  </button>
                );
              })}
            </div>

            {/* Low/Out Stock Warning alerts */}
            {selectedSize && (
              <div style={{ marginTop: '14px' }}>
                {selectedSizeStock === 0 ? (
                  <span style={{ color: 'hsl(var(--danger))', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} /> Size {selectedSize} is currently sold out.
                  </span>
                ) : selectedSizeStock < 5 ? (
                  <span style={{ color: 'hsl(var(--warning))', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} /> Low stock! Only {selectedSizeStock} items left in size {selectedSize}.
                  </span>
                ) : (
                  <span style={{ color: 'hsl(var(--success))', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ✓ In Stock ({selectedSizeStock} items available)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          {!isOutOfStock && selectedSizeStock > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quantity:</span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid hsl(var(--border-color))',
                borderRadius: 'var(--radius-sm)',
                padding: '4px'
              }}>
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}
                >-</button>
                <span style={{ width: '40px', textAlign: 'center', fontWeight: 600 }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(selectedSizeStock, quantity + 1))}
                  style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}
                >+</button>
              </div>
            </div>
          )}

          {/* Actions (Add to cart, Wishlist, WhatsApp share) */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || !selectedSize || selectedSizeStock === 0}
              className="btn btn-primary"
              style={{
                flex: 2,
                minWidth: '200px',
                padding: '16px',
                opacity: (isOutOfStock || !selectedSize || selectedSizeStock === 0) ? 0.5 : 1,
                cursor: (isOutOfStock || !selectedSize || selectedSizeStock === 0) ? 'not-allowed' : 'pointer'
              }}
            >
              <ShoppingBag size={18} /> Add to Cart
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              className="btn btn-secondary"
              style={{
                width: '56px',
                height: '56px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isFavorite ? 'hsl(var(--primary))' : 'inherit',
                borderColor: isFavorite ? 'hsl(var(--primary))' : 'hsl(var(--border-color))'
              }}
              aria-label="Add to wishlist"
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="btn btn-secondary"
              style={{
                width: '56px',
                height: '56px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderColor: '#25D366',
                color: '#25D366'
              }}
              title="Share on WhatsApp"
            >
              <Share2 size={20} />
            </button>
          </div>

        </div>
      </div>

      {/* Reviews Section */}
      <section style={{ marginBottom: '80px' }}>
        <h2 style={{ fontSize: '1.5rem', textTransform: 'uppercase', marginBottom: '24px', letterSpacing: '0.05em' }}>
          Customer Reviews ({product.reviews ? product.reviews.length : 0})
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px'
        }}>
          {/* Left Column: Review Form (only if authenticated) */}
          <div>
            <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '20px' }}>Write a review</h3>
              
              {token ? (
                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {reviewError && (
                    <div style={{ color: 'hsl(var(--danger))', fontSize: '0.85rem' }}>{reviewError}</div>
                  )}
                  {reviewSuccess && (
                    <div style={{ color: 'hsl(var(--success))', fontSize: '0.85rem' }}>✓ Review submitted successfully!</div>
                  )}
                  
                  {/* Rating Selector */}
                  <div className="form-group">
                    <label htmlFor="rating-select">Rating</label>
                    <select
                      id="rating-select"
                      className="form-control"
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                    >
                      <option value="5">5 Stars (Excellent)</option>
                      <option value="4">4 Stars (Good)</option>
                      <option value="3">3 Stars (Average)</option>
                      <option value="2">2 Stars (Poor)</option>
                      <option value="1">1 Star (Very Poor)</option>
                    </select>
                  </div>

                  {/* Comment */}
                  <div className="form-group">
                    <label htmlFor="comment-text">Your Feedback</label>
                    <textarea
                      id="comment-text"
                      rows="4"
                      className="form-control"
                      placeholder="Share your experience about size, fabric quality, and comfort..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={reviewLoading} style={{ padding: '12px' }}>
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', marginBottom: '16px' }}>
                    Please login to write a verified customer review.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Reviews List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '420px', overflowY: 'auto', paddingRight: '8px' }}>
            {!product.reviews || product.reviews.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'hsl(var(--text-muted))', border: '1px dashed hsl(var(--border-color))', borderRadius: 'var(--radius-sm)' }}>
                No reviews yet for this product. Be the first to review!
              </div>
            ) : (
              product.reviews.map((rev) => (
                <div 
                  key={rev._id}
                  style={{
                    padding: '20px',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <strong style={{ fontSize: '0.95rem' }}>{rev.name}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Rating Stars */}
                  <div style={{ display: 'flex', color: '#ffb400' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill={i < rev.rating ? 'currentColor' : 'none'} stroke="currentColor" />
                    ))}
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.6' }}>{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section style={{ marginBottom: '80px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '64px' }}>
          <h2 style={{ fontSize: '1.5rem', textTransform: 'uppercase', marginBottom: '32px', letterSpacing: '0.05em' }}>Related Garments</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '24px'
          }}>
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 0 && (
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '64px' }}>
          <h2 style={{ fontSize: '1.5rem', textTransform: 'uppercase', marginBottom: '32px', letterSpacing: '0.05em' }}>Recently Viewed</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '24px'
          }}>
            {recentlyViewed.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Custom responsive style overrides */}
      <style>{`
        @media (max-width: 768px) {
          .product-details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

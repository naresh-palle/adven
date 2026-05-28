import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { Heart, ShoppingBag, Star, Share2, AlertTriangle } from 'lucide-react';
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
    recentList = recentList.filter((p) => p._id !== currentProd._id);
    
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
    
    recentList = recentList.slice(0, 4);
    localStorage.setItem('adven_recent', JSON.stringify(recentList));
    setRecentlyViewed(recentList.filter((p) => p._id !== currentProd._id));
  };

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

  const handleWhatsAppShare = () => {
    const productUrl = window.location.href;
    const shareText = `Check out this premium ${product.name} at Adven for ₹${product.price}: ${productUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="loader"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold uppercase">Product not found</h2>
        <Link to="/shop" className="btn btn-secondary mt-5 inline-block">Back to Shop</Link>
      </div>
    );
  }

  const selectedSizeStockObj = product.sizes.find((s) => s.size === selectedSize);
  const selectedSizeStock = selectedSizeStockObj ? selectedSizeStockObj.stock : 0;
  const isOutOfStock = product.sizes.reduce((acc, curr) => acc + curr.stock, 0) === 0;
  const isFavorite = inWishlist(product._id);

  return (
    <div className="container mx-auto px-4 md:px-6 pt-10 animate-fade-in">
      
      {/* Product Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-20">
        
        {/* Left Column: Image previews */}
        <div className="flex flex-col gap-4">
          {/* Main Image container */}
          <div className="relative w-full pt-[125%] rounded-sm overflow-hidden border border-white/5 bg-[#0f0f13]">
            <img 
              src={activeImage} 
              alt={product.name} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Thumbnail row */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-thin">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-[70px] h-[85px] rounded-sm overflow-hidden shrink-0 border-2 bg-[#0f0f13] transition-all cursor-pointer ${
                    activeImage === img ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Garment Information & CTAs */}
        <div className="flex flex-col gap-5 lg:gap-6">
          {/* Category */}
          <span className="badge badge-gold self-start">{product.category}</span>
          
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase leading-tight text-white">{product.name}</h1>
          
          {/* Ratings summary */}
          {product.averageRating > 0 && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <div className="flex text-[#ffb400]">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    fill={i < Math.round(product.averageRating) ? 'currentColor' : 'none'} 
                    stroke="currentColor" 
                    className="shrink-0"
                  />
                ))}
              </div>
              <span className="font-semibold text-text-primary">{product.averageRating}</span>
              <span className="text-text-muted">({product.numberOfReviews} reviews)</span>
            </div>
          )}

          {/* Price */}
          <span className="text-2xl md:text-3xl font-extrabold text-primary font-display">
            ₹{product.price.toLocaleString('en-IN')}
          </span>

          {/* Description */}
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed font-light">
            {product.description}
          </p>

          <hr className="border-white/5" />

          {/* Size Selector Section */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs md:text-sm text-text-secondary uppercase tracking-wider">
              <span>Select Size:</span>
              <a href="#" className="text-primary hover:underline font-medium">Size Guide</a>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              {product.sizes.map((s) => {
                const outOfStock = s.stock === 0;
                const isSelected = selectedSize === s.size;
                return (
                  <button
                    key={s.size}
                    onClick={() => !outOfStock && setSelectedSize(s.size)}
                    disabled={outOfStock}
                    className={`min-w-[50px] h-12 px-3 border text-xs font-semibold rounded-sm transition-all flex items-center justify-center cursor-pointer ${
                      isSelected 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : outOfStock 
                          ? 'border-white/5 bg-transparent text-text-muted line-through opacity-30 cursor-not-allowed' 
                          : 'border-border-color bg-white/[0.02] text-text-secondary hover:border-primary/40 hover:text-text-primary'
                    }`}
                  >
                    {s.size}
                  </button>
                );
              })}
            </div>

            {/* Low/Out Stock Warning alerts */}
            {selectedSize && (
              <div className="mt-1 text-xs">
                {selectedSizeStock === 0 ? (
                  <span className="text-danger flex items-center gap-1.5 font-medium">
                    <AlertTriangle size={14} className="shrink-0" /> Size {selectedSize} is currently sold out.
                  </span>
                ) : selectedSizeStock < 5 ? (
                  <span className="text-warning flex items-center gap-1.5 font-medium">
                    <AlertTriangle size={14} className="shrink-0" /> Low stock! Only {selectedSizeStock} items left in size {selectedSize}.
                  </span>
                ) : (
                  <span className="text-success flex items-center gap-1.5 font-medium">
                    ✓ In Stock ({selectedSizeStock} items available)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          {!isOutOfStock && selectedSizeStock > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-xs md:text-sm text-text-secondary uppercase tracking-wider font-semibold">Quantity:</span>
              <div className="flex items-center border border-border-color rounded-sm p-1 bg-white/[0.02]">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors font-bold"
                >-</button>
                <span className="w-10 text-center font-bold text-text-primary">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(selectedSizeStock, quantity + 1))}
                  className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors font-bold"
                >+</button>
              </div>
            </div>
          )}

          {/* Actions (Add to cart, Wishlist, WhatsApp share) */}
          <div className="flex gap-3 flex-wrap mt-3">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || !selectedSize || selectedSizeStock === 0}
              className="btn btn-primary flex-1 py-4 text-xs md:text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <ShoppingBag size={16} /> Add to Cart
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              className={`btn btn-secondary !p-4 w-14 h-14 flex items-center justify-center ${
                isFavorite ? 'text-primary border-primary bg-primary/10' : 'text-text-secondary'
              }`}
              aria-label="Add to wishlist"
            >
              <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="btn btn-secondary !p-4 w-14 h-14 flex items-center justify-center !border-[#25D366]/40 !text-[#25D366] hover:!bg-[#25D366]/5"
              title="Share on WhatsApp"
            >
              <Share2 size={18} />
            </button>
          </div>

        </div>
      </div>

      {/* Reviews Section */}
      <section className="mb-20">
        <h2 className="text-xl md:text-2xl font-extrabold uppercase tracking-wide mb-6">
          Customer Reviews ({product.reviews ? product.reviews.length : 0})
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left Column: Write Review */}
          <div>
            <div className="glass p-6 md:p-8 rounded-sm border border-white/5 shadow-lg">
              <h3 className="text-base font-display font-semibold uppercase tracking-wider text-white mb-5">Write a review</h3>
              
              {token ? (
                <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                  {reviewError && (
                    <div className="text-danger text-xs">{reviewError}</div>
                  )}
                  {reviewSuccess && (
                    <div className="text-success text-xs">✓ Review submitted successfully!</div>
                  )}
                  
                  {/* Rating Selector */}
                  <div className="form-group mb-0">
                    <label htmlFor="rating-select" className="text-xs text-text-secondary uppercase tracking-wider mb-1.5 font-medium">Rating</label>
                    <select
                      id="rating-select"
                      className="form-control text-sm py-2 px-3 focus:!border-primary !bg-white/5"
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                    >
                      <option value="5" className="bg-card-bg">5 Stars (Excellent)</option>
                      <option value="4" className="bg-card-bg">4 Stars (Good)</option>
                      <option value="3" className="bg-card-bg">3 Stars (Average)</option>
                      <option value="2" className="bg-card-bg">2 Stars (Poor)</option>
                      <option value="1" className="bg-card-bg">1 Star (Very Poor)</option>
                    </select>
                  </div>

                  {/* Comment */}
                  <div className="form-group mb-0">
                    <label htmlFor="comment-text" className="text-xs text-text-secondary uppercase tracking-wider mb-1.5 font-medium">Your Feedback</label>
                    <textarea
                      id="comment-text"
                      rows="4"
                      className="form-control text-sm focus:!border-primary !bg-white/5"
                      placeholder="Share your experience about size, fabric quality, and comfort..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary w-full py-3.5 mt-2" disabled={reviewLoading}>
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-text-secondary">
                    Please login to write a verified customer review.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Reviews List */}
          <div className="flex flex-col gap-4 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin">
            {!product.reviews || product.reviews.length === 0 ? (
              <div className="py-12 text-center text-text-muted border border-dashed border-border-color rounded-sm">
                No reviews yet for this product. Be the first to review!
              </div>
            ) : (
              product.reviews.map((rev) => (
                <div 
                  key={rev._id}
                  className="p-5 border-b border-white/5 flex flex-col gap-2 bg-white/[0.01]"
                >
                  <div className="flex justify-between items-center gap-3 flex-wrap">
                    <strong className="text-sm text-text-primary">{rev.name}</strong>
                    <span className="text-xs text-text-muted">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex text-[#ffb400] mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} fill={i < rev.rating ? 'currentColor' : 'none'} stroke="currentColor" className="shrink-0" />
                    ))}
                  </div>

                  <p className="text-sm text-text-secondary leading-relaxed font-light mt-1">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mb-20 border-t border-white/5 pt-12 md:pt-16">
          <h2 className="text-xl md:text-2xl font-extrabold uppercase tracking-wide mb-8">Related Garments</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 0 && (
        <section className="border-t border-white/5 pt-12 md:pt-16 pb-10">
          <h2 className="text-xl md:text-2xl font-extrabold uppercase tracking-wide mb-8">Recently Viewed</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {recentlyViewed.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

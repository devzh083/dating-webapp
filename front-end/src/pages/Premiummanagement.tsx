import React, { useState, useEffect } from 'react';
import {
  Crown, Plus, Edit2, Trash2, Save, X, Eye, EyeOff,
  Star, Check, Zap, Flame, TrendingUp, Loader, AlertCircle
} from 'lucide-react';

interface PremiumPlan {
  plan_id: string;
  name: string;
  duration: string;
  plan_type: 'monthly' | 'quarterly' | 'biannual' | 'annual';
  price: number;
  original_price?: number;
  price_per_month: number;
  discount_text?: string;
  icon: string;
  color: string;
  gradient: string;
  popular: boolean;
  features: string[];
  active: boolean;
  display_order: number;
  calculation_months?: number; // NEW: Custom months for calculation
}

const ICON_OPTIONS = [
  { value: 'zap', label: 'Zap', icon: Zap },
  { value: 'flame', label: 'Flame', icon: Flame },
  { value: 'trending-up', label: 'Trending Up', icon: TrendingUp },
  { value: 'crown', label: 'Crown', icon: Crown },
  { value: 'star', label: 'Star', icon: Star },
];

const GRADIENT_OPTIONS = [
  { value: 'bg-gradient-to-br from-blue-500 to-cyan-500', label: 'Blue to Cyan' },
  { value: 'bg-gradient-to-br from-teal-500 to-emerald-500', label: 'Teal to Emerald' },
  { value: 'bg-gradient-to-br from-emerald-500 to-green-500', label: 'Emerald to Green' },
  { value: 'bg-gradient-to-br from-purple-500 to-pink-500', label: 'Purple to Pink' },
  { value: 'bg-gradient-to-br from-orange-500 to-red-500', label: 'Orange to Red' },
];

const PLAN_TYPE_OPTIONS = [
  { value: 'monthly', label: 'Monthly', months: 1 },
  { value: 'quarterly', label: 'Quarterly', months: 3 },
  { value: 'biannual', label: 'Biannual', months: 6 },
  { value: 'annual', label: 'Annual', months: 12 },
];

// Common month options
const MONTH_OPTIONS = [1, 3, 6, 12];

const PremiumManagement: React.FC = () => {
  const [plans, setPlans] = useState<PremiumPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Plan editing
  const [editingPlan, setEditingPlan] = useState<PremiumPlan | null>(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const plansRes = await fetch('http://127.0.0.1:8000/api/admin/premium/plans/', {
        headers: { 'Authorization': `Token ${token}` },
      });

      if (!plansRes.ok) {
        throw new Error('Failed to fetch premium data');
      }

      const plansData = await plansRes.json();

      console.log('Plans API Response:', plansData);

      // Handle different response formats
      let processedPlans: PremiumPlan[] = [];

      if (Array.isArray(plansData)) {
        processedPlans = plansData;
      } else if (plansData && typeof plansData === 'object' && Array.isArray(plansData.results)) {
        processedPlans = plansData.results;
      } else if (plansData && typeof plansData === 'object' && Array.isArray(plansData.data)) {
        processedPlans = plansData.data;
      } else if (plansData && typeof plansData === 'object' && plansData.plan_id) {
        processedPlans = [plansData];
      }

      // Ensure numeric fields are numbers, not strings
      processedPlans = processedPlans.map(plan => {
        const planTypeMonths = PLAN_TYPE_OPTIONS.find(opt => opt.value === plan.plan_type)?.months || 1;
        
        return {
          ...plan,
          price: typeof plan.price === 'string' ? parseFloat(plan.price) : plan.price,
          original_price: plan.original_price ? (typeof plan.original_price === 'string' ? parseFloat(plan.original_price) : plan.original_price) : undefined,
          price_per_month: typeof plan.price_per_month === 'string' ? parseFloat(plan.price_per_month) : plan.price_per_month,
          display_order: typeof plan.display_order === 'string' ? parseInt(plan.display_order) : plan.display_order,
          features: Array.isArray(plan.features) ? plan.features : [],
          // Set calculation_months based on plan type if not explicitly set
          calculation_months: plan.calculation_months || planTypeMonths,
        };
      });

      // Sort by display_order
      processedPlans.sort((a, b) => a.display_order - b.display_order);

      setPlans(processedPlans);

    } catch (error) {
      console.error('Error fetching premium data:', error);
      setError('Failed to load premium data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validatePlan = (plan: PremiumPlan): string[] => {
    const errors: string[] = [];

    if (!plan.plan_id || plan.plan_id.trim() === '') {
      errors.push('Plan ID is required');
    }

    if (!plan.name || plan.name.trim() === '') {
      errors.push('Plan name is required');
    }

    if (!plan.duration || plan.duration.trim() === '') {
      errors.push('Duration is required');
    }

    if (plan.price <= 0) {
      errors.push('Price must be greater than 0');
    }

    if (plan.original_price && plan.original_price <= plan.price) {
      errors.push('Original price must be greater than current price');
    }

    if (!plan.plan_type) {
      errors.push('Plan type is required');
    }

    if (!plan.calculation_months || plan.calculation_months <= 0) {
      errors.push('Number of months for calculation is required');
    }

    return errors;
  };

  const handleSavePlan = async (plan: PremiumPlan) => {
    // Validate the plan
    const errors = validatePlan(plan);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const url = isCreatingPlan
        ? 'http://127.0.0.1:8000/api/admin/premium/plans/'
        : `http://127.0.0.1:8000/api/admin/premium/plans/${plan.plan_id}/`;
      
      const method = isCreatingPlan ? 'POST' : 'PUT';

      // Calculate price_per_month using the specified months
      // Round to 2 decimal places to match Django DecimalField(max_digits=10, decimal_places=2)
      const months = plan.calculation_months || 1;
      const finalPricePerMonth = Math.round((plan.price / months) * 100) / 100;
      
      // Remove calculation_months from the data sent to backend (it's only for frontend)
      const { calculation_months, ...planDataForBackend } = plan;
      
      const planToSave = {
        ...planDataForBackend,
        price_per_month: finalPricePerMonth,
      };

      console.log('📤 Saving plan:');
      console.log('   Price:', plan.price);
      console.log('   Months:', months);
      console.log('   Price per month:', finalPricePerMonth);
      console.log('📦 Full plan data:', planToSave);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planToSave),
      });

      if (response.ok) {
        await fetchData();
        setEditingPlan(null);
        setIsCreatingPlan(false);
        setValidationErrors([]);
        alert('Plan saved successfully!');
      } else {
        const errorData = await response.json();
        console.error('❌ Backend error:', errorData);
        
        // Show detailed error message
        let errorMessage = 'Failed to save plan';
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (typeof errorData === 'object') {
          errorMessage = JSON.stringify(errorData, null, 2);
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Failed to save plan. Please try again.');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/premium/plans/${planId}/`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Token ${token}` },
        }
      );

      if (response.ok) {
        await fetchData();
        alert('Plan deleted successfully!');
      } else {
        throw new Error('Failed to delete plan');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Failed to delete plan. Please try again.');
    }
  };

  const handleTogglePlanActive = async (planId: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/premium/plans/${planId}/toggle_active/`,
        {
          method: 'POST',
          headers: { 'Authorization': `Token ${token}` },
        }
      );
      
      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error toggling plan:', error);
    }
  };

  const handleTogglePlanPopular = async (planId: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/premium/plans/${planId}/toggle_popular/`,
        {
          method: 'POST',
          headers: { 'Authorization': `Token ${token}` },
        }
      );
      
      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error toggling popular:', error);
    }
  };

  const handleCreateNewPlan = () => {
    setIsCreatingPlan(true);
    setValidationErrors([]);
    setEditingPlan({
      plan_id: '',
      name: '',
      duration: '',
      plan_type: 'monthly',
      price: 0,
      price_per_month: 0,
      icon: 'zap',
      color: 'from-blue-500 to-cyan-500',
      gradient: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      popular: false,
      features: [],
      active: true,
      display_order: plans.length,
      calculation_months: 1, // Default to 1 month
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading premium management...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-800 mb-2">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pricing Plans Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Pricing Plans</h3>
              <p className="text-sm text-gray-600">{plans.length} plan(s)</p>
            </div>
          </div>
          <button
            onClick={handleCreateNewPlan}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add Plan
          </button>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-12">
            <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No premium plans yet</p>
            <button
              onClick={handleCreateNewPlan}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
            >
              Create Your First Plan
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {plans.map((plan) => (
              <PlanCard
                key={plan.plan_id}
                plan={plan}
                onEdit={() => {
                  setEditingPlan(plan);
                  setValidationErrors([]);
                }}
                onDelete={() => handleDeletePlan(plan.plan_id)}
                onToggleActive={() => handleTogglePlanActive(plan.plan_id)}
                onTogglePopular={() => handleTogglePlanPopular(plan.plan_id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <PlanEditModal
          plan={editingPlan}
          isCreating={isCreatingPlan}
          onSave={handleSavePlan}
          onCancel={() => {
            setEditingPlan(null);
            setIsCreatingPlan(false);
            setValidationErrors([]);
          }}
          onChange={setEditingPlan}
          validationErrors={validationErrors}
        />
      )}
    </div>
  );
};

// Plan Card Component
const PlanCard: React.FC<{
  plan: PremiumPlan;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onTogglePopular: () => void;
}> = ({ plan, onEdit, onDelete, onToggleActive, onTogglePopular }) => {
  const IconComponent = ICON_OPTIONS.find(opt => opt.value === plan.icon)?.icon || Crown;

  const features = Array.isArray(plan.features) ? plan.features : [];
  const price = typeof plan.price === 'number' ? plan.price : parseFloat(plan.price || '0');
  const originalPrice = plan.original_price ? (typeof plan.original_price === 'number' ? plan.original_price : parseFloat(plan.original_price)) : undefined;
  const pricePerMonth = typeof plan.price_per_month === 'number' ? plan.price_per_month : parseFloat(plan.price_per_month || '0');

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex gap-4 flex-1">
          <div className={`w-14 h-14 rounded-xl ${plan.gradient} flex items-center justify-center flex-shrink-0`}>
            <IconComponent className="w-7 h-7 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              {plan.popular && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Popular
                </span>
              )}
              {!plan.active && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                  Inactive
                </span>
              )}
              <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                {plan.plan_type}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-3">{plan.duration}</p>

            <div className="flex items-baseline gap-2 mb-3 flex-wrap">
              <span className="text-3xl font-black text-gray-900">₹{price.toFixed(2)}</span>
              {originalPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">₹{originalPrice.toFixed(2)}</span>
                  {plan.discount_text && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                      {plan.discount_text}
                    </span>
                  )}
                </>
              )}
            </div>

            <p className="text-sm text-gray-500 mb-3">
              ₹{pricePerMonth.toFixed(2)}/month
              {plan.calculation_months && (
                <span className="text-xs text-gray-400 ml-1">
                  (calculated over {plan.calculation_months} month{plan.calculation_months > 1 ? 's' : ''})
                </span>
              )}
            </p>

            {features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded-full flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{feature}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg transition"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleActive}
            className={`p-2 border rounded-lg transition ${plan.active ? 'text-gray-600 border-gray-200 hover:bg-gray-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
            title={plan.active ? 'Deactivate' : 'Activate'}
          >
            {plan.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={onTogglePopular}
            className={`p-2 border rounded-lg transition ${plan.popular ? 'text-yellow-600 border-yellow-200 hover:bg-yellow-50' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            title={plan.popular ? 'Remove Popular' : 'Mark as Popular'}
          >
            <Star className={`w-4 h-4 ${plan.popular ? 'fill-yellow-400' : ''}`} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Plan Edit Modal Component
const PlanEditModal: React.FC<{
  plan: PremiumPlan;
  isCreating: boolean;
  onSave: (plan: PremiumPlan) => void;
  onCancel: () => void;
  onChange: (plan: PremiumPlan) => void;
  validationErrors: string[];
}> = ({ plan, isCreating, onSave, onCancel, onChange, validationErrors }) => {
  const [newFeature, setNewFeature] = useState('');

  const features = Array.isArray(plan.features) ? plan.features : [];
  const months = plan.calculation_months || 1;

  // Calculate price per month dynamically (rounded to 2 decimal places)
  const calculatedPricePerMonth = Math.round((plan.price / months) * 100) / 100;

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      onChange({ ...plan, features: [...features, newFeature.trim()] });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    onChange({ ...plan, features: features.filter((_, i) => i !== index) });
  };

  const handlePriceChange = (newPrice: number) => {
    console.log('💵 Price changed to:', newPrice);
    onChange({
      ...plan,
      price: newPrice,
    });
  };

  const handleMonthsChange = (newMonths: number) => {
    console.log('📅 Months changed to:', newMonths);
    onChange({
      ...plan,
      calculation_months: newMonths,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isCreating ? 'Create New Plan' : 'Edit Plan'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-800 mb-2">Please fix the following errors:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, idx) => (
                    <li key={idx} className="text-sm text-red-700">{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Plan ID */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Plan ID *
            </label>
            <input
              type="text"
              value={plan.plan_id}
              onChange={(e) => onChange({ ...plan, plan_id: e.target.value })}
              disabled={!isCreating}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100"
              placeholder="e.g., monthly, quarterly"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {isCreating ? 'Unique identifier for this plan (cannot be changed later)' : 'Plan ID cannot be changed'}
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Plan Name *
            </label>
            <input
              type="text"
              value={plan.name}
              onChange={(e) => onChange({ ...plan, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g., Monthly Premium"
              required
            />
          </div>

          {/* Duration & Plan Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration *
              </label>
              <input
                type="text"
                value={plan.duration}
                onChange={(e) => onChange({ ...plan, duration: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="e.g., 1 Month"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Plan Type *
              </label>
              <select
                value={plan.plan_type}
                onChange={(e) => onChange({ ...plan, plan_type: e.target.value as PremiumPlan['plan_type'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                {PLAN_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                value={plan.price}
                onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Original Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={plan.original_price || ''}
                onChange={(e) => onChange({ ...plan, original_price: parseFloat(e.target.value) || undefined })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Optional"
              />
            </div>
          </div>

          {/* ✨ NEW: Number of Months for Calculation */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Calculate Price Over How Many Months? *
            </label>
            <div className="grid grid-cols-4 gap-3">
              {MONTH_OPTIONS.map((monthOption) => (
                <button
                  key={monthOption}
                  type="button"
                  onClick={() => handleMonthsChange(monthOption)}
                  className={`px-4 py-3 rounded-lg border-2 font-semibold transition ${
                    months === monthOption
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-300 hover:border-teal-300 text-gray-700'
                  }`}
                >
                  {monthOption} {monthOption === 1 ? 'Month' : 'Months'}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Select the number of months to divide the price by
            </p>
          </div>

          {/* Calculated Price Per Month (read-only display) */}
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">Calculated Monthly Cost</span>
            </div>
            <p className="text-3xl font-black text-blue-600 mb-1">
              ₹{calculatedPricePerMonth.toFixed(2)}<span className="text-lg font-normal">/month</span>
            </p>
            <p className="text-sm text-blue-700">
              ₹{plan.price.toFixed(2)} ÷ {months} month{months > 1 ? 's' : ''} = ₹{calculatedPricePerMonth.toFixed(2)}/month
            </p>
          </div>

          {/* Discount Text */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Discount Text
            </label>
            <input
              type="text"
              value={plan.discount_text || ''}
              onChange={(e) => onChange({ ...plan, discount_text: e.target.value || undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g., Save 20%"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional badge to show discount amount (only shown if original price is set)
            </p>
          </div>

          {/* Icon & Gradient */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Icon
              </label>
              <select
                value={plan.icon}
                onChange={(e) => onChange({ ...plan, icon: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                {ICON_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gradient
              </label>
              <select
                value={plan.gradient}
                onChange={(e) => onChange({ ...plan, gradient: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                {GRADIENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Display Order */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Display Order
            </label>
            <input
              type="number"
              value={plan.display_order}
              onChange={(e) => onChange({ ...plan, display_order: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower numbers appear first in the list
            </p>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Features
            </label>
            <div className="space-y-2 mb-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...features];
                      newFeatures[index] = e.target.value;
                      onChange({ ...plan, features: newFeatures });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <button
                    onClick={() => handleRemoveFeature(index)}
                    className="p-2 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Add a feature..."
              />
              <button 
                onClick={handleAddFeature} 
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onSave(plan)}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white h-12 rounded-lg hover:opacity-90 transition font-semibold"
          >
            <Save className="w-4 h-4" />
            {isCreating ? 'Create Plan' : 'Save Changes'}
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumManagement;
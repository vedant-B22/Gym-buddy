'use client';

import React, { useState, useEffect } from 'react';
import {
  Apple,
  Droplets,
  Plus,
  Search,
  X,
  CheckCircle,
  Flame,
  Calculator,
  ChevronRight,
} from 'lucide-react';

export default function NutritionTrackerPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  // Meal selection for adding food
  const [activeMealType, setActiveMealType] = useState('LUNCH');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [servingQty, setServingQty] = useState('1');

  // Calculator form state
  const [calcWeight, setCalcWeight] = useState('76');
  const [calcHeight, setCalcHeight] = useState('178');
  const [calcGoal, setCalcGoal] = useState('Muscle Gain'); // Fat Loss, Muscle Gain, Maintenance
  const [calculatedTarget, setCalculatedTarget] = useState<any | null>(null);

  const fetchNutrition = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/nutrition');
      if (res.ok) {
        const d = await res.json();
        setData(d);
        if (d.foods) setSearchResults(d.foods);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNutrition();
  }, []);

  const handleSearchFoods = async (q: string) => {
    setSearchQuery(q);
    try {
      const res = await fetch(`/api/nutrition?search=${encodeURIComponent(q)}`);
      if (res.ok) {
        const d = await res.json();
        setSearchResults(d.foods || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddWater = async (amountMl: number) => {
    try {
      const res = await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'LOG_WATER', amountMl }),
      });
      if (res.ok) fetchNutrition();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFood) return;

    const qty = parseFloat(servingQty) || 1;
    const payload = {
      action: 'LOG_FOOD',
      mealType: activeMealType,
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      servingQty: qty,
      calories: Math.round(selectedFood.calories * qty),
      protein: Math.round(selectedFood.protein * qty),
      carbs: Math.round(selectedFood.carbs * qty),
      fat: Math.round(selectedFood.fat * qty),
    };

    try {
      const res = await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowFoodModal(false);
        setSelectedFood(null);
        setServingQty('1');
        fetchNutrition();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCalculateTdee = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(calcWeight) || 75;
    const h = parseFloat(calcHeight) || 175;
    // BMR estimation: 10 * w + 6.25 * h - 5 * 25 + 5
    const bmr = 10 * w + 6.25 * h - 120;
    const maintenance = Math.round(bmr * 1.55); // Moderate gym exercise

    let calories = maintenance;
    if (calcGoal === 'Fat Loss') calories = maintenance - 500;
    if (calcGoal === 'Muscle Gain') calories = maintenance + 350;

    const protein = Math.round(w * 2.0); // 2g per kg
    const fat = Math.round((calories * 0.25) / 9);
    const carbs = Math.round((calories - (protein * 4 + fat * 9)) / 4);

    setCalculatedTarget({ calories, protein, carbs, fat, water: 3500 });
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-xs text-slate-400">Loading daily nutrition tracker...</p>
      </div>
    );
  }

  const totals = data.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const targets = data.targets || { dailyCaloriesTarget: 2400, proteinTarget: 150, carbsTarget: 280, fatTarget: 65, waterTargetMl: 3000 };
  const waterMl = data.waterMl || 0;

  const calPct = Math.min(100, Math.round((totals.calories / targets.dailyCaloriesTarget) * 100));
  const waterPct = Math.min(100, Math.round((waterMl / targets.waterTargetMl) * 100));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black uppercase text-white tracking-tight">Nutrition & Macros</h1>
          <p className="text-xs text-slate-400">Track daily calories, Indian foods & hydration.</p>
        </div>

        <button
          onClick={() => setShowCalculator(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors"
        >
          <Calculator className="w-3.5 h-3.5 text-emerald-400" />
          <span>Calculator</span>
        </button>
      </div>

      {/* Calories & Macros Main Ring Card */}
      <div className="bg-[#121927] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Today&apos;s Calorie Intake
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl font-black text-white">{totals.calories}</span>
              <span className="text-xs text-slate-400">/ {targets.dailyCaloriesTarget} kcal</span>
            </div>
          </div>

          <div className="w-14 h-14 rounded-full border-4 border-slate-800 flex items-center justify-center relative">
            <span className="font-black text-xs text-emerald-400">{calPct}%</span>
          </div>
        </div>

        {/* Macros Breakdown Bars */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800">
          {/* Protein */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Protein</span>
              <span className="font-bold text-emerald-400">{totals.protein}g / {targets.proteinTarget}g</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.min(100, (totals.protein / targets.proteinTarget) * 100)}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Carbs</span>
              <span className="font-bold text-amber-400">{totals.carbs}g / {targets.carbsTarget}g</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${Math.min(100, (totals.carbs / targets.carbsTarget) * 100)}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Fats</span>
              <span className="font-bold text-blue-400">{totals.fat}g / {targets.fatTarget}g</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${Math.min(100, (totals.fat / targets.fatTarget) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Water Hydration Tracker */}
      <div className="bg-[#121927] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Water Intake
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400">
            {waterMl} / {targets.waterTargetMl} ml ({waterPct}%)
          </span>
        </div>

        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-400 rounded-full transition-all"
            style={{ width: `${waterPct}%` }}
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => handleAddWater(250)}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-bold border border-slate-700 transition-colors"
          >
            + 250ml (Glass)
          </button>
          <button
            onClick={() => handleAddWater(500)}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-bold border border-slate-700 transition-colors"
          >
            + 500ml (Shaker)
          </button>
        </div>
      </div>

      {/* Meals Log Section */}
      <div className="space-y-3">
        {['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'].map((meal) => {
          const mealLogs = (data.logs || []).filter((l: any) => l.mealType === meal);
          const mealCals = mealLogs.reduce((acc: number, l: any) => acc + l.calories, 0);

          return (
            <div
              key={meal}
              className="bg-[#121927] border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-xs uppercase tracking-wider text-white">
                    {meal}
                  </h3>
                  <span className="text-[10px] text-slate-400">{mealCals} kcal</span>
                </div>

                <button
                  onClick={() => {
                    setActiveMealType(meal);
                    setShowFoodModal(true);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-700"
                >
                  <Plus className="w-3 h-3" /> Add Food
                </button>
              </div>

              {mealLogs.length > 0 ? (
                <div className="space-y-1 pt-1 border-t border-slate-800/80">
                  {mealLogs.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs py-1 text-slate-300"
                    >
                      <span>
                        {item.foodName} <span className="text-slate-500 font-mono">({item.servingQty}x)</span>
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {item.calories} kcal • {item.protein}P
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic">No food logged for {meal.toLowerCase()}.</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Food Search & Log Modal */}
      {showFoodModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121927] border border-slate-800 rounded-3xl w-full max-w-md h-[80vh] flex flex-col p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-sm text-white uppercase tracking-wider">
                Add to {activeMealType}
              </h3>
              <button
                onClick={() => {
                  setShowFoodModal(false);
                  setSelectedFood(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedFood ? (
              /* Selected Food Quantity Form */
              <form onSubmit={handleLogFood} className="py-4 space-y-4 my-auto">
                <div className="p-4 bg-slate-900 border border-emerald-500/30 rounded-2xl">
                  <h4 className="font-black text-base text-white">{selectedFood.name}</h4>
                  {selectedFood.hindiName && (
                    <span className="text-xs text-emerald-400 font-medium">{selectedFood.hindiName}</span>
                  )}
                  <p className="text-xs text-slate-400 mt-1">Per serving: {selectedFood.servingSize}</p>

                  <div className="grid grid-cols-4 gap-2 text-center mt-3 pt-3 border-t border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Calories</span>
                      <strong className="text-white">{selectedFood.calories}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Protein</span>
                      <strong className="text-emerald-400">{selectedFood.protein}g</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Carbs</span>
                      <strong className="text-amber-400">{selectedFood.carbs}g</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Fat</span>
                      <strong className="text-blue-400">{selectedFood.fat}g</strong>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Number of Servings
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={servingQty}
                    onChange={(e) => setServingQty(e.target.value)}
                    className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFood(null)}
                    className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs uppercase"
                  >
                    Log Food Item
                  </button>
                </div>
              </form>
            ) : (
              /* Search Indian Foods List */
              <>
                <div className="relative my-3">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search Paneer, Roti, Dal, Chicken, Eggs..."
                    value={searchQuery}
                    onChange={(e) => handleSearchFoods(e.target.value)}
                    className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {searchResults.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFood(f)}
                      className="w-full p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between transition-colors group"
                    >
                      <div>
                        <h4 className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">
                          {f.name} {f.hindiName && <span className="text-slate-400 font-normal">({f.hindiName})</span>}
                        </h4>
                        <p className="text-[10px] text-slate-500">
                          {f.servingSize} • {f.calories} kcal • {f.protein}g Protein
                        </p>
                      </div>
                      <Plus className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Target Macro Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121927] border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-sm text-white uppercase tracking-wider">
                Macro Target Calculator
              </h3>
              <button onClick={() => setShowCalculator(false)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCalculateTdee} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(e.target.value)}
                    className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={calcHeight}
                    onChange={(e) => setCalcHeight(e.target.value)}
                    className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Goal</label>
                <select
                  value={calcGoal}
                  onChange={(e) => setCalcGoal(e.target.value)}
                  className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Fat Loss">Fat Loss (500 kcal Deficit)</option>
                  <option value="Muscle Gain">Muscle Gain (350 kcal Surplus)</option>
                  <option value="Maintenance">Maintenance / Recomposition</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs uppercase"
              >
                Calculate Targets
              </button>

              {calculatedTarget && (
                <div className="p-3 bg-slate-900 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Calories:</span>
                    <strong className="text-emerald-400">{calculatedTarget.calories} kcal</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Protein:</span>
                    <strong className="text-white">{calculatedTarget.protein}g</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Carbs:</span>
                    <strong className="text-white">{calculatedTarget.carbs}g</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fats:</span>
                    <strong className="text-white">{calculatedTarget.fat}g</strong>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

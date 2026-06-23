"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import { 
  UtensilsCrossed, 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  Utensils, 
  Wine, 
  IceCream, 
  ChefHat,
  StickyNote,
  MapPin,
  CalendarDays
} from "lucide-react";
import { createCateringMenu, updateCateringMenu, deleteCateringMenu } from "@/app/actions/catering-menu";

interface Ceremony {
  id: string;
  name: string;
  isFoodServed: boolean;
  location: string;
  startTime: Date;
}

interface Vendor {
  id: string;
  name: string;
}

interface CateringMenu {
  id: string;
  weddingId: string;
  ceremonyId: string;
  vendorId: string | null;
  cuisine: string | null;
  guestCount: number;
  appetizers: string | null;
  mainCourses: string | null;
  desserts: string | null;
  drinks: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MenuPlannerClientProps {
  weddingId: string;
  initialMenus: CateringMenu[];
  ceremonies: Ceremony[];
  vendors: Vendor[];
}

export default function MenuPlannerClient({
  weddingId,
  initialMenus,
  ceremonies,
  vendors,
}: MenuPlannerClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedCeremonyId = searchParams.get("ceremonyId");

  const [menus, setMenus] = React.useState<CateringMenu[]>(initialMenus);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingMenu, setEditingMenu] = React.useState<CateringMenu | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form states
  const [ceremonyId, setCeremonyId] = React.useState("");
  const [vendorId, setVendorId] = React.useState("");
  const [cuisine, setCuisine] = React.useState("");
  const [guestCount, setGuestCount] = React.useState(100);
  const [appetizers, setAppetizers] = React.useState("");
  const [mainCourses, setMainCourses] = React.useState("");
  const [desserts, setDesserts] = React.useState("");
  const [drinks, setDrinks] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);

  const handleEdit = (menu: CateringMenu) => {
    setEditingMenu(menu);
    setCeremonyId(menu.ceremonyId);
    setVendorId(menu.vendorId || "");
    setCuisine(menu.cuisine || "");
    setGuestCount(menu.guestCount);
    setAppetizers(menu.appetizers || "");
    setMainCourses(menu.mainCourses || "");
    setDesserts(menu.desserts || "");
    setDrinks(menu.drinks || "");
    setNotes(menu.notes || "");
    setIsFormOpen(true);
  };

  // Auto-open form if ceremonyId is in search params
  React.useEffect(() => {
    if (preselectedCeremonyId) {
      // Find if a menu already exists for this ceremony
      const existing = menus.find(m => m.ceremonyId === preselectedCeremonyId);
      setTimeout(() => {
        if (existing) {
          handleEdit(existing);
        } else {
          setCeremonyId(preselectedCeremonyId);
          setIsFormOpen(true);
        }
      }, 0);
      // Clear URL params
      const url = new URL(window.location.href);
      url.searchParams.delete("ceremonyId");
      router.replace(url.pathname + url.search);
    }
  }, [preselectedCeremonyId, menus, router]);

  const resetForm = () => {
    setCeremonyId("");
    setVendorId("");
    setCuisine("");
    setGuestCount(100);
    setAppetizers("");
    setMainCourses("");
    setDesserts("");
    setDrinks("");
    setNotes("");
    setEditingMenu(null);
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this catering menu?")) return;
    const res = await deleteCateringMenu(id);
    if (res.success) {
      setMenus(menus.filter(m => m.id !== id));
      setToast({ message: "Menu deleted successfully!", type: "success" });
    } else {
      setToast({ message: res.error || "Failed to delete menu", type: "error" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ceremonyId) {
      setToast({ message: "Please select a ceremony", type: "error" });
      return;
    }

    setIsPending(true);
    const payload = {
      weddingId,
      ceremonyId,
      vendorId: vendorId || null,
      cuisine: cuisine || null,
      guestCount,
      appetizers: appetizers || null,
      mainCourses: mainCourses || null,
      desserts: desserts || null,
      drinks: drinks || null,
      notes: notes || null,
    };

    if (editingMenu) {
      const res = await updateCateringMenu(editingMenu.id, payload);
      if (res.success && res.data) {
        setMenus(menus.map(m => m.id === editingMenu.id ? (res.data as CateringMenu) : m));
        setToast({ message: "Catering menu updated successfully!", type: "success" });
        resetForm();
      } else {
        setToast({ message: res.error || "Failed to update menu", type: "error" });
      }
    } else {
      // Check if a menu already exists for this ceremony
      if (menus.some(m => m.ceremonyId === ceremonyId)) {
        setToast({ message: "A menu is already planned for this ceremony.", type: "error" });
        setIsPending(false);
        return;
      }
      const res = await createCateringMenu(payload);
      if (res.success && res.data) {
        setMenus([...menus, res.data as CateringMenu]);
        setToast({ message: "Catering menu created successfully!", type: "success" });
        resetForm();
      } else {
        setToast({ message: res.error || "Failed to create menu", type: "error" });
      }
    }
    setIsPending(false);
  };

  const getVendorName = (vId: string | null) => {
    return vendors.find(v => v.id === vId)?.name || "Not Assigned";
  };

  const getCeremonyDetails = (cId: string) => {
    return ceremonies.find(c => c.id === cId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {!isFormOpen && (
          <Button
            onClick={() => setIsFormOpen(true)}
            variant="primary"
            className="bg-[#6771ab] hover:bg-[#566198] text-white flex items-center gap-2 font-semibold"
          >
            <Plus className="h-4 w-4" />
            Plan A Menu
          </Button>
        )}
      </div>

      {isFormOpen && (
        <Card variant="cream" className="p-6 border border-slate-200 shadow-sm max-w-4xl">
          <h2 className="text-md font-bold text-[#6771ab] mb-4 uppercase tracking-widest">
            {editingMenu ? "Edit Catering Menu" : "New Catering Menu"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Select Ceremony *
                </label>
                <Select
                  value={ceremonyId}
                  onChange={(e) => setCeremonyId(e.target.value)}
                  required
                  disabled={isPending}
                >
                  <option value="">Choose a ceremony...</option>
                  {ceremonies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.isFoodServed ? "(Food Served)" : ""}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Cuisine Type
                </label>
                <Input
                  type="text"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  placeholder="e.g. North Indian, Italian Buffet, Fusion"
                  disabled={isPending}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Catering Vendor
                </label>
                <Select
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  disabled={isPending}
                >
                  <option value="">No vendor assigned yet</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Expected Guest Count
                </label>
                <Input
                  type="number"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  placeholder="100"
                  min="0"
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Appetizers / Starters
                </label>
                <textarea
                  value={appetizers}
                  onChange={(e) => setAppetizers(e.target.value)}
                  placeholder="Enter items (e.g. Paneer Tikka, Spring Rolls, Bruschetta)"
                  className="w-full min-h-[100px] text-sm p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6771ab] transition-all bg-white"
                  disabled={isPending}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Main Courses
                </label>
                <textarea
                  value={mainCourses}
                  onChange={(e) => setMainCourses(e.target.value)}
                  placeholder="Enter items (e.g. Butter Chicken, Dal Makhani, Veg Lasagna, Garlic Naan)"
                  className="w-full min-h-[100px] text-sm p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6771ab] transition-all bg-white"
                  disabled={isPending}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Desserts / Sweets
                </label>
                <textarea
                  value={desserts}
                  onChange={(e) => setDesserts(e.target.value)}
                  placeholder="Enter items (e.g. Gulab Jamun with Ice Cream, Chocolate Lava Cake)"
                  className="w-full min-h-[100px] text-sm p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6771ab] transition-all bg-white"
                  disabled={isPending}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Drinks & Beverages
                </label>
                <textarea
                  value={drinks}
                  onChange={(e) => setDrinks(e.target.value)}
                  placeholder="Enter items (e.g. Mocktails, Wine, Soft Drinks, Masala Chai)"
                  className="w-full min-h-[100px] text-sm p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6771ab] transition-all bg-white"
                  disabled={isPending}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Special Instructions / Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Dietary requests, allergen alerts, service timeline, etc."
                className="w-full min-h-[80px] text-sm p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6771ab] transition-all bg-white"
                disabled={isPending}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                onClick={resetForm}
                variant="ghost"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="bg-[#6771ab] hover:bg-[#566198] text-white px-6 font-semibold"
                disabled={isPending}
              >
                {isPending ? "Saving..." : editingMenu ? "Update Menu" : "Create Menu"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {menus.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-slate-200 text-center">
          <div className="h-12 w-12 rounded-full bg-[#f0f1fa] flex items-center justify-center text-[#6771ab] mb-4">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No catering menus planned yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Create menus for your ceremonies and coordinate your guest counts and caterers.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menus.map((menu) => {
            const ceremony = getCeremonyDetails(menu.ceremonyId);
            return (
              <Card key={menu.id} className="p-6 border border-slate-200 shadow-sm bg-white hover:border-[#8b93c5] transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-md font-bold text-slate-800">
                        {ceremony?.name || "Unknown Ceremony"}
                      </h3>
                      {menu.cuisine && (
                        <span className="inline-flex mt-1 text-[11px] font-semibold bg-[#eef0f7] text-[#2d336b] px-2 py-0.5 rounded-sm">
                          {menu.cuisine}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(menu)}
                        className="h-8 w-8 text-slate-400 hover:text-slate-600"
                        title="Edit Menu"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(menu.id)}
                        className="h-8 w-8 text-slate-400 hover:text-red-600"
                        title="Delete Menu"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Quick Info Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl mb-4 text-slate-600 border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <ChefHat className="h-4 w-4 text-slate-400" />
                      <span>{getVendorName(menu.vendorId)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span>{menu.guestCount} Guests</span>
                    </div>
                    {ceremony && (
                      <>
                        <div className="flex items-center gap-1.5 col-span-2">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span className="truncate">{ceremony.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 col-span-2">
                          <CalendarDays className="h-4 w-4 text-slate-400" />
                          <span>{new Date(ceremony.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Menu Sections */}
                  <div className="space-y-3 mt-4 text-sm">
                    {menu.appetizers && (
                      <div className="border-l-2 border-[#8b93c5] pl-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                          <Utensils className="h-3.5 w-3.5" /> Appetizers / Starters
                        </div>
                        <p className="text-slate-600 text-xs whitespace-pre-line">{menu.appetizers}</p>
                      </div>
                    )}

                    {menu.mainCourses && (
                      <div className="border-l-2 border-[#8b93c5] pl-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                          <UtensilsCrossed className="h-3.5 w-3.5" /> Main Course
                        </div>
                        <p className="text-slate-600 text-xs whitespace-pre-line">{menu.mainCourses}</p>
                      </div>
                    )}

                    {menu.desserts && (
                      <div className="border-l-2 border-[#8b93c5] pl-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                          <IceCream className="h-3.5 w-3.5" /> Desserts
                        </div>
                        <p className="text-slate-600 text-xs whitespace-pre-line">{menu.desserts}</p>
                      </div>
                    )}

                    {menu.drinks && (
                      <div className="border-l-2 border-[#8b93c5] pl-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                          <Wine className="h-3.5 w-3.5" /> Drinks & Beverages
                        </div>
                        <p className="text-slate-600 text-xs whitespace-pre-line">{menu.drinks}</p>
                      </div>
                    )}

                    {menu.notes && (
                      <div className="bg-[#fcfcfa] dark:bg-amber-950/20 p-3 rounded-xl border border-yellow-100 dark:border-amber-900/30 mt-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                          <StickyNote className="h-3.5 w-3.5" /> Notes
                        </div>
                        <p className="text-slate-600 text-xs whitespace-pre-line leading-relaxed">{menu.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

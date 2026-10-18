import IngredientEditor from "@/components/admin/IngredientEditor";

export default function NewIngredient() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Nuevo ingrediente</h1>
      <IngredientEditor />
    </div>
  );
}

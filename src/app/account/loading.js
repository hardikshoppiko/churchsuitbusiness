import FormSkeleton from "@/components/loaders/FormSkeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <FormSkeleton />
    </div>
  );
}
import { Search } from "lucide-react";
import { Input } from "../ui/input";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function SearchBar({
  value,
  onChange,
}: Props) {
  return (
    <div className="sticky top-0 z-20 bg-background pb-5">

      <div className="relative">

        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={value}
          placeholder="Search people or posts..."
          className="h-12 rounded-xl pl-11"
          onChange={(e) =>
            onChange(e.target.value)
          }
        />

      </div>

    </div>
  );
}
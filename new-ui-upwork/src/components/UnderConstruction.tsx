import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

const UnderConstruction = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <Construction className="w-8 h-8 text-yellow-600" />
          </div>
          <CardTitle className="text-xl">Page Under Construction</CardTitle>
          <CardDescription>
            This page is currently being developed. Please check back later.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            We're working hard to bring you this feature soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnderConstruction; 
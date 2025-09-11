
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const lookerStudioLinks = {
    cobranzas: "https://lookerstudio.google.com/embed/reporting/5b21c42a-b61d-47cc-a108-cd021ebdcf47/page/yJkVF",
    call: "https://lookerstudio.google.com/embed/reporting/ae94a5d8-c6a3-4b98-b358-7c158d063284/page/yJkVF"
};

export function LookerStudioPanel() {
  return (
    <Card className="w-full border-0 shadow-none">
        <CardContent className="p-0">
            <Tabs defaultValue="cobranzas" className="w-full">
                <TabsList>
                    <TabsTrigger value="cobranzas">Cobranzas</TabsTrigger>
                    <TabsTrigger value="call">Call</TabsTrigger>
                </TabsList>
                <TabsContent value="cobranzas">
                    <div className="w-full h-[70vh] border rounded-lg overflow-hidden mt-4">
                        <iframe
                            title="Reporte Cobranzas"
                            width="100%"
                            height="100%"
                            src={lookerStudioLinks.cobranzas}
                            allowFullScreen
                            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
                        ></iframe>
                    </div>
                </TabsContent>
                <TabsContent value="call">
                    <div className="w-full h-[70vh] border rounded-lg overflow-hidden mt-4">
                        <iframe
                            title="Reporte Call"
                            width="100%"
                            height="100%"
                            src={lookerStudioLinks.call}
                            allowFullScreen
                            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
                        ></iframe>
                    </div>
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}


'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const lookerStudioLinks = {
    servicios: "https://lookerstudio.google.com/u/0/reporting/ca0754f7-3807-4b4f-bb70-e2f7e6a04b08/page/uVhZF",
    retencion: "https://lookerstudio.google.com/u/0/reporting/ca0754f7-3807-4b4f-bb70-e2f7e6a04b08/page/uVhZF"
};

export function LookerStudioPanel() {
  return (
    <Tabs defaultValue="servicios" className="w-full">
        <div className="flex justify-center">
            <TabsList>
                <TabsTrigger value="servicios">Servicios</TabsTrigger>
                <TabsTrigger value="retencion">Retención</TabsTrigger>
            </TabsList>
        </div>
        <TabsContent value="servicios">
            <div className="w-full h-[70vh] border rounded-lg overflow-hidden mt-4">
                <iframe
                    title="Reporte Servicios"
                    width="100%"
                    height="100%"
                    src={lookerStudioLinks.servicios}
                    allowFullScreen
                    sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
                ></iframe>
            </div>
        </TabsContent>
        <TabsContent value="retencion">
            <div className="w-full h-[70vh] border rounded-lg overflow-hidden mt-4">
                <iframe
                    title="Reporte Retención"
                    width="100%"
                    height="100%"
                    src={lookerStudioLinks.retencion}
                    allowFullScreen
                    sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
                ></iframe>
            </div>
        </TabsContent>
    </Tabs>
  );
}

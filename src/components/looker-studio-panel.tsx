
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const lookerStudioLinks = {
    cobranzas: "https://lookerstudio.google.com/embed/reporting/5b21c42a-b61d-47cc-a108-cd021ebdcf47/page/yJkVF",
    call: "https://lookerstudio.google.com/embed/reporting/ae94a5d8-c6a3-4b98-b358-7c158d063284/page/yJkVF"
};

export function LookerStudioPanel() {
  return (
    <Tabs defaultValue="cobranzas" className="w-full">
        <div className="flex justify-center">
            <TabsList>
                <TabsTrigger value="cobranzas">Casa Menor</TabsTrigger>
                <TabsTrigger value="call">Call</TabsTrigger>
                <TabsTrigger value="casa_mayor">Casa Mayor</TabsTrigger>
                <TabsTrigger value="abogados">Abogados</TabsTrigger>
                <TabsTrigger value="bot">Bot</TabsTrigger>
            </TabsList>
        </div>
        <TabsContent value="cobranzas">
            <div className="w-full h-[70vh] border rounded-lg overflow-hidden mt-4">
                <iframe
                    title="Reporte Casa Menor"
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
        <TabsContent value="casa_mayor">
            <div className="w-full h-[70vh] border rounded-lg overflow-hidden mt-4">
                <iframe
                    title="Reporte Casa Mayor"
                    width="100%"
                    height="100%"
                    src={lookerStudioLinks.cobranzas}
                    allowFullScreen
                    sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
                ></iframe>
            </div>
        </TabsContent>
        <TabsContent value="abogados">
            <div className="w-full h-[70vh] border rounded-lg overflow-hidden mt-4">
                <iframe
                    title="Reporte Abogados"
                    width="100%"
                    height="100%"
                    src={lookerStudioLinks.cobranzas}
                    allowFullScreen
                    sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
                ></iframe>
            </div>
        </TabsContent>
        <TabsContent value="bot">
            <div className="w-full h-[70vh] border rounded-lg overflow-hidden mt-4">
                <iframe
                    title="Reporte Bot"
                    width="100%"
                    height="100%"
                    src={lookerStudioLinks.cobranzas}
                    allowFullScreen
                    sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
                ></iframe>
            </div>
        </TabsContent>
    </Tabs>
  );
}

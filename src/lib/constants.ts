export const DATASET_CONFIG: Record<string, string> = {
    Servicios: 'resultados_evaluaciones_servicios_servicios.json',
    Preferente: 'resultados_evaluaciones_servicios_preferente.json',
    'Retención': 'resultados_evaluaciones_servicios_retencion.json',
    Bloqueos: 'resultados_evaluaciones_servicios_bloqueos.json',
};

export const DEFAULT_DATASET = 'Servicios';

export const QUESTIONS_FOR_REPORTS: Record<string, string[]> = {
    'Retención': [
        '¿Por qué los clientes prefieren la competencia?',
        '¿Cuál es la principal objeción de los clientes?',
        '¿Qué bancos de la competencia prefieren los clientes?',
        '¿Cuáles son las mejores prácticas del asesor?',
        '¿En qué momentos se tienen mayores tiempos de espera?',
        '¿Cuál es el tiempo promedio del proceso de retención?',
        '¿Cuál es el tiempo promedio de una venta cruzada?',
        '¿En promedio cuántas veces se rebaten objeciones a los clientes?',
    ],
    Servicios: [
        '¿Qué es lo que más aprecia el cliente en el contacto? (Ej: Agilidad, amabilidad, solución, otras)',
        '¿Cuáles son las 3 características o el patrón de las llamadas más exitosas?',
        '¿Cuál es el principal del dolor que el cliente manifiesta en los contactos? (Ej: demoras, complejidad, transferencias, falta de empatía, falta de conocimiento)',
        '¿Cuál es la causa de más llamadas? (Ej: si es consulta de movimientos, ¿qué activa la llamada?, una transacción sin nombre, una consulta en los canales digitales…)',
        'A nivel general, ¿se identifica que en cada skill, el cliente quede con alguna duda o insatisfacción al finalizar la llamada?',
        'Para los clientes que indican en la llamada que ya se habían comunicado, ¿Cuál fue la causa del recontacto? ¿podríamos haberlo evitado?',
        'A nivel general, dentro de la llamada, ¿el cliente nos compara con alguna otra entidad financiera?, si es así, ¿alguna a destacar?',
    ],
    Bloqueos: [
        '¿Qué es lo que más aprecia el cliente en el contacto? (Ej: Agilidad, amabilidad, solución, otras)',
        '¿Se manifiesta por el cliente reincidencia en el fraude?, ¿Algún comercio puntual?,¿alguna situación particular, que a lo mejor permita identificar un patrón?',
        '¿Cuáles son las 3 características o el patrón de las llamadas más exitosas?',
        '¿Qué opinión tiene el cliente del proceso de bloqueo? (Ej: demorado, fácil, incomodo, molesto…)',
        '¿Cuál es el principal del dolor que el cliente manifiesta en los contactos? (Ej: demoras, complejidad, transferencias, falta de empatía, falta de conocimiento)',
        'A nivel general, ¿se identifica que en cada skill, el cliente quede con alguna duda o insatisfacción al finalizar la llamada?',
        'Para los clientes que indican en la llamada que ya se habían comunicado, ¿Cuál fue la causa del recontacto? ¿podríamos haberlo evitado?',
        'El cliente manifiesta dentro de la llamada, ¿cuál pudo ser la causa del posible fraude?',
        'A nivel general, dentro de la llamada, ¿el cliente nos compara con alguna otra entidad financiera?, si es así, ¿alguna a destacar?',
    ],
    Preferente: [
        '¿Qué es lo que más aprecia el cliente en el contacto? (Ej: Agilidad, amabilidad, solución, otras)',
        '¿Cuáles son las 3 características o el patrón de las llamadas más exitosas?',
        '¿Cuál es el principal del dolor que el cliente manifiesta en los contactos? (Ej: demoras, complejidad, transferencias, falta de empatía, falta de conocimiento)',
        '¿Cuál es la causa de más llamadas? (Ej: si es consulta de movimientos, ¿qué activa la llamada?, una transacción sin nombre, una consulta en los canales digitales…)',
        'A nivel general, ¿se identifica que en cada skill, el cliente quede con alguna duda o insatisfacción al finalizar la llamada?',
        'Para los clientes que indican en la llamada que ya se habían comunicado, ¿Cuál fue la causa del recontacto? ¿podríamos haberlo evitado?',
        'A nivel general, dentro de la llamada, ¿el cliente nos compara con alguna otra entidad financiera?, si es así, ¿alguna a destacar?',
    ],
};

export function getQuestionsForDataset(datasetName?: string): string[] {
    if (datasetName && QUESTIONS_FOR_REPORTS[datasetName]) {
        return [...QUESTIONS_FOR_REPORTS[datasetName]];
    }
    return [...QUESTIONS_FOR_REPORTS[DEFAULT_DATASET]];
}

export interface CallEvaluation {
  dataset: string;
  id_llamada_procesada: string;
  evaluacion_llamada: string;
}

export const evaluationsData: CallEvaluation[] = [
  {
    dataset: 'Cobranzas Call',
    id_llamada_procesada: 'call_001',
    evaluacion_llamada:
      'Asesor: Juan Perez | Cliente: Maria Rodriguez | Motivo: Atraso en pago de tarjeta de crédito | Promesa de pago: Sí | Monto: $250.000 | Emoción cliente: Neutral | Observaciones: Cliente cooperativa, acuerda pagar la próxima semana.',
  },
  {
    dataset: 'Cobranzas Call',
    id_llamada_procesada: 'call_002',
    evaluacion_llamada:
      'Asesor: Ana Garcia | Cliente: Carlos Lopez | Motivo: Deuda de préstamo personal | Promesa de pago: No | Emoción cliente: Enojado | Objeción: "Los intereses son muy altos" | Observaciones: Cliente no está de acuerdo con el monto total, se niega a pagar.',
  },
  {
    dataset: 'Cobranzas Call',
    id_llamada_procesada: 'call_003',
    evaluacion_llamada:
      'Asesor: Juan Perez | Cliente: Sofia Fernandez | Motivo: Atraso en pago de tarjeta de crédito | Promesa de pago: Sí | Monto: $150.000 | Emoción cliente: Ansioso | Observaciones: Cliente menciona problemas de flujo de caja pero se compromete a un pago parcial.',
  },
  {
    dataset: 'Cobranzas Call',
    id_llamada_procesada: 'call_004',
    evaluacion_llamada:
      'Asesor: Pedro Martinez | Cliente: Lucia Gomez | Motivo: Deuda de crédito vehicular | Promesa de pago: No | Emoción cliente: Frustrado | Objeción: "Ya realicé el pago, debe haber un error" | Observaciones: Cliente insiste en que el pago fue hecho. Se escala para verificación.',
  },
  {
    dataset: 'Cobranzas Call',
    id_llamada_procesada: 'call_005',
    evaluacion_llamada:
      'Asesor: Ana Garcia | Cliente: Javier Torres | Motivo: Atraso en pago de tarjeta de crédito | Promesa de pago: Sí | Monto: $500.000 | Emoción cliente: Neutral | Observaciones: Cliente realiza el pago durante la llamada.',
  },
  {
    dataset: 'Cobranzas Call',
    id_llamada_procesada: 'call_006',
    evaluacion_llamada:
      'Asesor: Juan Perez | Cliente: Valentina Diaz | Motivo: Deuda de préstamo personal | Promesa de pago: No | Emoción cliente: Neutral | Objeción: "No tengo el dinero en este momento" | Observaciones: Cliente solicita un plazo más largo para pagar.',
  },
  {
    dataset: 'Cobranzas Call',
    id_llamada_procesada: 'call_007',
    evaluacion_llamada:
      'Asesor: Pedro Martinez | Cliente: Ricardo Morales | Motivo: Atraso en pago de tarjeta de crédito | Promesa de pago: Sí | Monto: $300.000 | Emoción cliente: Positivo | Observaciones: Cliente agradece el recordatorio y se compromete a pagar de inmediato.',
  },
  {
    dataset: 'Cobranzas Call',
    id_llamada_procesada: 'call_008',
    evaluacion_llamada:
      'Asesor: Ana Garcia | Cliente: Camila Ortiz | Motivo: Deuda de crédito vehicular | Promesa de pago: No | Emoción cliente: Enojado | Objeción: "Su servicio es terrible" | Observaciones: Cliente muy molesto por llamadas anteriores. Termina la llamada abruptamente.',
  },
  // Add 142 more mock records to reach 150 total for realistic slider
  ...Array.from({ length: 142 }, (_, i) => {
    const
 
asesores = ['Juan Perez', 'Ana Garcia', 'Pedro Martinez'];
    const emociones = ['Neutral', 'Enojado', 'Ansioso', 'Frustrado', 'Positivo'];
    const promesas = ['Sí', 'No'];
    const objeciones = ['"Los intereses son muy altos"', '"Ya realicé el pago"', '"No tengo el dinero"', '"Su servicio es terrible"', 'Ninguna'];
    const asesor = asesores[i % asesores.length];
    const emocion = emociones[i % emociones.length];
    const promesa = promesas[i % promesas.length];
    const objecion = promesa === 'No' ? objeciones[i % objeciones.length] : 'Ninguna';
    const monto = (Math.floor(Math.random() * 20) + 1) * 50000;

    return {
        dataset: 'Cobranzas Call',
        id_llamada_procesada: `call_${String(i + 9).padStart(3, '0')}`,
        evaluacion_llamada: `Asesor: ${asesor} | Cliente: Cliente_${i+9} | Motivo: Atraso en pago | Promesa de pago: ${promesa} | ${promesa === 'Sí' ? `Monto: $${monto}` : ''} | Emoción cliente: ${emocion} | Objeción: ${objecion} | Observaciones: Observación genérica número ${i+9}.`
    };
  })
];

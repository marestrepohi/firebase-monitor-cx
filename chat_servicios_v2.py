import json
from typing import List, Optional

import streamlit as st
from google import genai
from google.genai import types

# --- CONFIGURACIÓN DE ENTORNO Y CONSTANTES ---
MODE = globals().get("MODE")
CHAT_DATASET = globals().get("CHAT_DATASET")
CHAT_LIMIT = globals().get("CHAT_LIMIT")
REPORT_DATASET = globals().get("REPORT_DATASET")
REPORT_LIMIT = globals().get("REPORT_LIMIT")

STANDALONE_MODE = MODE is None
resolved_mode = (MODE or "tabs").lower()

if STANDALONE_MODE:
    try:
        st.set_page_config(
            page_title="Auditbot CX",
            page_icon="data:image/webp;base64,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",
            layout="wide",
            initial_sidebar_state="expanded",
        )
    except Exception:
        pass

# --- CONFIGURACIÓN INICIAL DE GEMINI ---
client = genai.Client(
    vertexai=True,
    project="augusta-bbog-dev-activo",
    location="global",
    http_options=types.HttpOptions(api_version="v1"),
)
generate_content_config = types.GenerateContentConfig(
    temperature=0.6,
    top_p=0.95,
    thinking_config=types.ThinkingConfig(thinking_budget=-1),
)

# Definir rutas de los archivos de evaluaciones (alineadas con app_servicios_v2)
DATASET_PATHS = {
    "Servicios": "/home/ec2-user/data-bbog-integration-monitor-assistant/data/resultados_evaluaciones_servicios_servicios.json",
    "Preferente": "/home/ec2-user/data-bbog-integration-monitor-assistant/data/resultados_evaluaciones_servicios_preferente.json",
    "Retención": "/home/ec2-user/data-bbog-integration-monitor-assistant/data/resultados_evaluaciones_servicios_retencion.json",
    "Bloqueos": "/home/ec2-user/data-bbog-integration-monitor-assistant/data/resultados_evaluaciones_servicios_bloqueos.json",
}

# --- PREGUNTAS PREDEFINIDAS PARA INFORMES ---
QUESTIONS_FOR_REPORTS = {
    "Retención": [
        "¿Por qué los clientes prefieren la competencia?",
        "¿Cuál es la principal objeción de los clientes?",
        "¿Qué bancos de la competencia prefieren los clientes?",
        "¿Cuáles son las mejores prácticas del asesor?",
        "¿En qué momentos se tienen mayores tiempos de espera?",
        "¿Cuál es el tiempo promedio del proceso de retención?",
        "¿Cuál es el tiempo promedio de una venta cruzada?",
        "¿En promedio cuántas veces se rebaten objeciones a los clientes?",
    ],
    "Servicios": [
        "¿Qué es lo que más aprecia el cliente en el contacto? (Ej: Agilidad, amabilidad, solución, otras)",
        "¿Cuáles son las 3 características o el patrón de las llamadas más exitosas?",
        "¿Cuál es el principal del dolor que el cliente manifiesta en los contactos? (Ej: demoras, complejidad, transferencias, falta de empatía, falta de conocimiento)",
        "¿Cuál es la causa de más llamadas? (Ej: si es consulta de movimientos, ¿qué activa la llamada?, una transacción sin nombre, una consulta en los canales digitales…)",
        "A nivel general, ¿se identifica que en cada skill, el cliente quede con alguna duda o insatisfacción al finalizar la llamada?",
        "Para los clientes que indican en la llamada que ya se habían comunicado, ¿Cuál fue la causa del recontacto? ¿podríamos haberlo evitado?",
        "A nivel general, dentro de la llamada, ¿el cliente nos compara con alguna otra entidad financiera?, si es así, ¿alguna a destacar?",
    ],
    "Bloqueos": [
        "¿Qué es lo que más aprecia el cliente en el contacto? (Ej: Agilidad, amabilidad, solución, otras)",
        "¿Se manifiesta por el cliente reincidencia en el fraude?, ¿Algún comercio puntual?,¿alguna situación particular, que a lo mejor permita identificar un patrón?",
        "¿Cuáles son las 3 características o el patrón de las llamadas más exitosas?",
        "¿Qué opinión tiene el cliente del proceso de bloqueo? (Ej: demorado, fácil, incomodo, molesto…)",
        "¿Cuál es el principal del dolor que el cliente manifiesta en los contactos? (Ej: demoras, complejidad, transferencias, falta de empatía, falta de conocimiento)",
        "A nivel general, ¿se identifica que en cada skill, el cliente quede con alguna duda o insatisfacción al finalizar la llamada?",
        "Para los clientes que indican en la llamada que ya se habían comunicado, ¿Cuál fue la causa del recontacto? ¿podríamos haberlo evitado?",
        "El cliente manifiesta dentro de la llamada, ¿cuál pudo ser la causa del posible fraude?",
        "A nivel general, dentro de la llamada, ¿el cliente nos compara con alguna otra entidad financiera?, si es así, ¿alguna a destacar?",
    ],
    "Preferente": [
        "¿Qué es lo que más aprecia el cliente en el contacto? (Ej: Agilidad, amabilidad, solución, otras)",
        "¿Cuáles son las 3 características o el patrón de las llamadas más exitosas?",
        "¿Cuál es el principal del dolor que el cliente manifiesta en los contactos? (Ej: demoras, complejidad, transferencias, falta de empatía, falta de conocimiento)",
        "¿Cuál es la causa de más llamadas? (Ej: si es consulta de movimientos, ¿qué activa la llamada?, una transacción sin nombre, una consulta en los canales digitales…)",
        "A nivel general, ¿se identifica que en cada skill, el cliente quede con alguna duda o insatisfacción al finalizar la llamada?",
        "Para los clientes que indican en la llamada que ya se habían comunicado, ¿Cuál fue la causa del recontacto? ¿podríamos haberlo evitado?",
        "A nivel general, dentro de la llamada, ¿el cliente nos compara con alguna otra entidad financiera?, si es así, ¿alguna a destacar?",
    ],
}


def _dataset_keys() -> List[str]:
    return list(DATASET_PATHS.keys())


@st.cache_data(show_spinner=False)
def load_evaluation_data(
    dataset_key: Optional[str] = None,
    limit: Optional[int] = None,
) -> List[dict]:
    """Carga los datos de evaluación filtrados por dataset opcional."""

    datasets = [dataset_key] if dataset_key else _dataset_keys()
    aggregated: List[dict] = []

    for key in datasets:
        path = DATASET_PATHS.get(key)
        if not path:
            st.warning(f"Dataset '{key}' no tiene una ruta configurada.")
            continue

        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except FileNotFoundError:
            st.warning(f"Archivo no encontrado para '{key}': {path}")
            continue
        except Exception as exc:  # pylint: disable=broad-except
            st.warning(f"Error al cargar '{key}': {exc}")
            continue

        dataset_rows: List[dict] = []
        for item in data:
            evaluation = item.get("evaluacion_llamada_raw") or item.get("evaluacion_llamada")
            if not evaluation:
                continue
            dataset_rows.append(
                {
                    "dataset": key,
                    "id_llamada_procesada": item.get("id_llamada_procesada", ""),
                    "evaluacion_llamada": evaluation,
                }
            )

        if limit:
            dataset_rows = dataset_rows[: int(limit)]

        aggregated.extend(dataset_rows)

    return aggregated


def build_evaluation_context(records: List[dict]) -> str:
    """Convierte los registros en un bloque de texto legible por el modelo."""

    if not records:
        return ""

    segments: List[str] = []
    for item in records:
        evaluation = item.get("evaluacion_llamada", "")
        if isinstance(evaluation, (dict, list)):
            evaluation_text = json.dumps(evaluation, ensure_ascii=False)
        else:
            evaluation_text = str(evaluation)

        segments.append(
            "\n".join(
                [
                    "---",
                    f"ID: {item.get('id_llamada_procesada', '')}",
                    f"Dataset: {item.get('dataset', '')}",
                    f"Evaluación: {evaluation_text}",
                    "---",
                ]
            )
        )

    return "\n".join(segments)

def _resolve_dataset(dataset_key: Optional[str], warning_prefix: str) -> str:
    options = _dataset_keys()
    if not options:
        raise RuntimeError("No hay datasets configurados para el módulo de servicios.")

    if dataset_key and dataset_key in DATASET_PATHS:
        return dataset_key

    if dataset_key and dataset_key not in DATASET_PATHS:
        st.warning(f"{warning_prefix}: la fuente '{dataset_key}' no está configurada. Se usará '{options[0]}'.")

    return options[0]


def get_gemini_response(prompt: str, evaluation_context: str = "") -> str:
    """Genera una respuesta usando Gemini para el chat."""

    try:
        if evaluation_context:
            enhanced_prompt = (
                "Contexto de evaluaciones previas:\n"
                f"{evaluation_context}\n\n"
                "Consulta del usuario:\n"
                f"{prompt}"
            )
        else:
            enhanced_prompt = prompt

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[enhanced_prompt],
            config=generate_content_config,
        )
        return response.text
    except Exception as exc:  # pylint: disable=broad-except
        return f"Lo siento, ocurrió un error al comunicarse con el modelo: {exc}"


def generate_structured_report(source_name: str, report_context: str, questions: List[str]) -> str:
    """Genera un informe estratégico con el formato esperado."""

    formatted_questions = "\n".join([f"- {question}" for question in questions])

    report_prompt = f"""
**Rol y Objetivo:**
Asume el rol de un **Analista Estratégico Senior de Experiencia del Cliente (CX)**. Tu objetivo es generar un informe ejecutivo con insights profundos y accionables para la gerencia del banco. El análisis debe basarse ÚNICA Y EXCLUSIVAMENTE en las evaluaciones de llamadas del dataset de '{source_name}' que se proporcionan a continuación.

**Contexto de Análisis (Evaluaciones de Llamadas de '{source_name}')**
---
{report_context}
---

**Formato de Salida Obligatorio:**
1. **Resumen Ejecutivo**
   - Párrafo inicial que sintetice los 3-4 hallazgos más críticos y la principal recomendación estratégica.
2. **Análisis Detallado por Pregunta**
   - Responde cada pregunta listada usando viñetas para los puntos clave.
3. **Tabla de Insights y Recomendaciones Estratégicas**
   - Tabla en Markdown con columnas: "Hallazgo Clave", "Impacto Potencial (Cliente/Negocio)", "Recomendación Estratégica".

**Instrucciones de Análisis:**
* Cuantifica los hallazgos cuando sea posible.
* Sustenta afirmaciones con ejemplos o citas textuales anónimas.
* Enfoca las recomendaciones desde una visión estratégica (retención, eficiencia, mejora de producto, etc.).
* Usa **negritas** para conceptos clave.
* Si la información no es suficiente, indícalo explícitamente sin inventar datos.

**Preguntas a responder en el análisis detallado:**
{formatted_questions}

Inicia el informe directamente sin mensajes introductorios adicionales.
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-pro",
            contents=[report_prompt],
            config=generate_content_config,
        )
        return response.text
    except Exception as exc:  # pylint: disable=broad-except
        return f"Lo siento, ocurrió un error al generar el informe: {exc}"


def render_chat_view(
    dataset_key: Optional[str],
    record_limit: Optional[int],
    allow_dataset_selector: bool,
) -> None:
    st.header("Chat con Asistente de Evaluaciones")
    st.info("Realiza preguntas abiertas sobre la fuente de datos seleccionada.")

    effective_dataset = _resolve_dataset(dataset_key, "Chat interactivo")
    available_datasets = _dataset_keys()

    if allow_dataset_selector:
        col_dataset, col_limit = st.columns([3, 1])
        with col_dataset:
            effective_dataset = st.selectbox(
                "Fuente de datos",
                options=available_datasets,
                index=available_datasets.index(effective_dataset),
                key="chat_dataset_selector",
            )
        with col_limit:
            default_limit = int(record_limit or 500)
            record_limit = st.number_input(
                "Límite de registros",
                min_value=50,
                max_value=5000,
                value=default_limit,
                step=50,
                key="chat_limit_selector",
            )
    else:
        st.caption(
            f"Fuente seleccionada: **{effective_dataset}** | Registros: {record_limit or 'todos'}"
        )

    evaluations = load_evaluation_data(effective_dataset, record_limit)
    if not evaluations:
        st.error("No se encontraron registros con la configuración actual.")
        return

    evaluation_context = build_evaluation_context(evaluations)

    if STANDALONE_MODE:
        st.sidebar.success(
            f"Cargados {len(evaluations)} registros de '{effective_dataset}' para el chat."
        )
        if st.sidebar.checkbox("Ver contexto del chat", key="chat_context_toggle"):
            with st.sidebar.expander("Contexto de evaluaciones (muestra)"):
                st.code(evaluation_context[:5000])

    messages_key = f"chat_messages_{effective_dataset}"
    if messages_key not in st.session_state:
        st.session_state[messages_key] = []

    for message in st.session_state[messages_key]:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    chat_input_key = f"chat_input_{effective_dataset}"
    if prompt := st.chat_input("¿En qué puedo ayudarte?", key=chat_input_key):
        st.session_state[messages_key].append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        with st.chat_message("assistant"):
            with st.spinner("Pensando..."):
                response = get_gemini_response(prompt, evaluation_context)
                st.markdown(response)

        st.session_state[messages_key].append({"role": "assistant", "content": response})


def render_report_view(
    dataset_key: Optional[str],
    record_limit: Optional[int],
    allow_dataset_selector: bool,
) -> None:
    st.header("Generador de Informes Estratégicos")
    st.info("Selecciona una fuente y genera un informe con preguntas predefinidas.")

    effective_dataset = _resolve_dataset(dataset_key, "Generador de informes")
    available_datasets = _dataset_keys()

    if allow_dataset_selector:
        col_dataset, col_limit = st.columns([3, 1])
        with col_dataset:
            effective_dataset = st.selectbox(
                "Fuente de datos",
                options=available_datasets,
                index=available_datasets.index(effective_dataset),
                key="report_dataset_selector",
            )
        with col_limit:
            default_limit = int(record_limit or 500)
            record_limit = st.number_input(
                "Límite de registros",
                min_value=50,
                max_value=5000,
                value=default_limit,
                step=50,
                key="report_limit_selector",
            )
    else:
        st.caption(
            f"Fuente seleccionada: **{effective_dataset}** | Registros: {record_limit or 'todos'}"
        )

    evaluations = load_evaluation_data(effective_dataset, record_limit)
    if not evaluations:
        st.error("No hay datos disponibles para generar el informe.")
        return

    questions = QUESTIONS_FOR_REPORTS.get(effective_dataset)
    if not questions:
        st.error(f"No hay preguntas predefinidas para '{effective_dataset}'.")
        return

    st.write(
        f"Se analizarán **{len(evaluations)}** registros del dataset **{effective_dataset}**."
    )

    button_key = f"generate_report_button_{effective_dataset}"
    if st.button("✨ Generar Informe", key=button_key):
        report_context = build_evaluation_context(evaluations)
        with st.spinner(
            f"Analizando {len(evaluations)} registros de '{effective_dataset}' y generando informe..."
        ):
            report_text = generate_structured_report(
                effective_dataset,
                report_context,
                questions,
            )

        st.success("¡Informe generado con éxito!")
        st.markdown("---")
        st.markdown(report_text)


def render_tabs_layout() -> None:
    if STANDALONE_MODE:
        st.title("Auditbot CX - BdB")

    tab_chat, tab_report = st.tabs(["💬 Chat Interactivo", "📊 Generador de Informes"])
    with tab_chat:
        render_chat_view(dataset_key=None, record_limit=None, allow_dataset_selector=True)
    with tab_report:
        render_report_view(dataset_key=None, record_limit=None, allow_dataset_selector=True)


def render_mode_layout() -> None:
    if resolved_mode == "chat":
        render_chat_view(
            dataset_key=CHAT_DATASET,
            record_limit=CHAT_LIMIT,
            allow_dataset_selector=False,
        )
    elif resolved_mode == "report":
        render_report_view(
            dataset_key=REPORT_DATASET,
            record_limit=REPORT_LIMIT,
            allow_dataset_selector=False,
        )
    else:
        render_tabs_layout()


render_mode_layout()
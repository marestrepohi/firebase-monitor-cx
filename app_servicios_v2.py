import streamlit as st
st.set_page_config(layout="wide")  # Configurar layout ancho para todo el app
import streamlit.components.v1 as components  # para usar iframe
import pandas as pd
import json
import re  # para parseo de URI GCS
import os
import time
from datetime import datetime
from google.cloud import storage  # para descargar audio desde GCS
from google import genai
# Google GenAI types import
from google.genai import types

# Configuración global para Gemini (usada por funciones de chat/reportes, si existen)
generate_content_config = types.GenerateContentConfig(
    temperature=0.7,
    top_p=0.8,
    top_k=40,
    candidate_count=1,
    seed=12345,
    max_output_tokens=8192,
    stop_sequences=["STOP"]
)

def generate_report(source, context, questions):
    """Genera reporte automatizado basado en fuente de datos y preguntas predefinidas"""
    formatted_questions = "\n".join([f"• {q}" for q in questions])
    
    report_prompt = f"""
    Actúa como un Analista Estratégico Senior de Experiencia del Cliente especializado en cobranzas bancarias.

    **CONTEXTO DE DATOS:**
    Fuente: {source}
    {context}

    **PREGUNTAS A RESPONDER:**
    {formatted_questions}

    **FORMATO DEL INFORME:**

    ## 📊 RESUMEN EJECUTIVO

    ### Hallazgos Clave
    - [Punto clave 1]
    - [Punto clave 2] 
    - [Punto clave 3]

    ### Recomendaciones Prioritarias
    1. **[Recomendación 1]**
    2. **[Recomendación 2]**
    3. **[Recomendación 3]**

    ## 📈 ANÁLISIS DETALLADO

    [Responde cada pregunta con datos específicos y análisis profundo]

    **INSTRUCCIONES:**
    - Usa datos específicos del contexto
    - Incluye métricas cuantificables cuando sea posible
    - No inventes información
    - Si no hay datos suficientes, indícalo claramente
    """

    try:
        client = genai.Client()
        response = client.models.generate_content(
            model='gemini-2.5-pro',
            contents=[report_prompt],
            config=generate_content_config
        )
        return response.text
    except Exception as e:
        return f"Error al generar reporte: {str(e)}"

# --- Eliminar elementos de header por defecto ---
st.markdown("""
    <style>
    .stApp > header {
        background-color: transparent;
    }
    .stApp > header [data-testid="stDecoration"] {
        display: none;
    }
    .css-1d391kg, .css-1544g2n {
        background-color: transparent;
    }
    header[data-testid="stHeader"] {
        height: 0rem;
        background: transparent;
    }
    .stApp > header {
        background: transparent;
    }
    .main .block-container {
        padding-top: 0rem;
    }
    </style>
""", unsafe_allow_html=True)

# --- Menú lateral ---
st.sidebar.markdown("""
    <div style="text-align: center; padding: 1rem;">
        <img src="https://www.bancodebogota.com/s/minisitios/noticias/edicion-uno/bank-of-bogota/img/aval.png" width="200">
    </div>
""", unsafe_allow_html=True)

st.sidebar.markdown("---")
st.sidebar.markdown("## 🚀 Navegación Principal")

# Menú de navegación principal
menu_option = st.sidebar.selectbox(
    "Seleccione una opción:",
    [
        "📊 Monitor de Evaluaciones",
        "🎤 Procesamiento de Audio",
        "💬 Chat Interactivo",
        "📊 Generador de Informes",
    "📈 Reportes BI"
    ],
    index=0
)

st.sidebar.markdown("---")

# Mostrar contenido según la selección del menú
# Mostrar contenido según la selección del menú
if menu_option == "📊 Monitor de Evaluaciones":
    
    # --- Opciones específicas para Monitor de Evaluaciones ---
    st.sidebar.markdown("### ⚙️ Configuración")
    
    # --- Elección de dataset de evaluaciones ---
    file_options = {
        "Servicios": "/home/ec2-user/data-bbog-integration-monitor-assistant/data/resultados_evaluaciones_servicios_servicios.json",
        "Preferente": "/home/ec2-user/data-bbog-integration-monitor-assistant/data/resultados_evaluaciones_servicios_preferente.json",
        "Retención": "/home/ec2-user/data-bbog-integration-monitor-assistant/data/resultados_evaluaciones_servicios_retencion.json",
        "Bloqueos": "/home/ec2-user/data-bbog-integration-monitor-assistant/data/resultados_evaluaciones_servicios_bloqueos.json"
    }
    selected_dataset = st.sidebar.selectbox("📂 Seleccione tipo de evaluación", list(file_options.keys()))
    DATA_PATH = file_options[selected_dataset]

    # --- Funciones de Carga y Visualización ---
    @st.cache_data
    def load_data(path):
        """Carga los datos desde un archivo JSON y los devuelve como un DataFrame."""
        try:
            with open(path, "r", encoding="utf-8") as f:
                datos_json = json.load(f)
            df = pd.DataFrame(datos_json)
            # Mapear evaluacion_llamada a evaluacion_llamada_raw si hace falta
            if 'evaluacion_llamada_raw' not in df.columns and 'evaluacion_llamada' in df.columns:
                df['evaluacion_llamada_raw'] = df['evaluacion_llamada']
            if 'id_llamada_procesada' not in df.columns or 'evaluacion_llamada_raw' not in df.columns:
                st.error("El archivo JSON debe contener las columnas 'id_llamada_procesada' y 'evaluacion_llamada_raw' o 'evaluacion_llamada'.")
                return None
            return df
        except FileNotFoundError:
            st.error(f"Error: No se encontró el archivo de datos en la ruta: {path}")
            return None
        except Exception as e:
            st.error(f"Ocurrió un error inesperado al cargar los datos: {e}")
            return None

    def mostrar_detalles_llamada(datos_llamada):
        """Muestra solo ID, transcripción y el JSON de evaluación en dos columnas."""
        # ID de la llamada
        st.markdown(f"## 📞 ID Llamada: {datos_llamada.get('id_llamada_procesada', '-')}")
        st.markdown("---")

        # Obtención de transcripción y evaluación
        raw_eval = datos_llamada.get('evaluacion_llamada_raw') or datos_llamada.get('evaluacion_llamada')
        transcripcion_texto = "No disponible."
        eval_dict = {}

        # Parsear evaluación en dict
        if isinstance(raw_eval, str):
            try:
                eval_dict = json.loads(raw_eval)
                # Extraer transcripción del JSON de evaluación
                if 'transcripcion' in eval_dict:
                    transcripcion_texto = eval_dict['transcripcion']
            except:
                eval_dict = {"error": "Texto de evaluación no es JSON válido"}
        elif isinstance(raw_eval, dict):
            eval_dict = raw_eval
            # Extraer transcripción del JSON de evaluación
            if 'transcripcion' in eval_dict:
                transcripcion_texto = eval_dict['transcripcion']
        else:
            eval_dict = {}

        # --- MÉTRICAS DE PRECISIÓN Y DATOS CLAVE ---
        st.subheader("📊 Métricas de Precisión y Datos Clave")

        # Extraer métricas de precisión del JSON de evaluación
        precision_cliente = eval_dict.get('precision_error_critico_cliente', 'N/A')
        precision_negocio = eval_dict.get('precision_error_critico_negocio', 'N/A')
        precision_cumplimiento = eval_dict.get('precision_error_critico_cumplimiento', 'N/A')
        precision_no_critico = eval_dict.get('precision_error_no_critico', 'N/A')
        precision_llamada = eval_dict.get('precision_llamada', 'N/A')

        # Extraer datos adicionales
        id_cliente = datos_llamada.get('celular', 'N/A')
        fecha_llamada = datos_llamada.get('fecha_llamada', datos_llamada.get('fecha', 'N/A'))

        # Mostrar métricas en columnas
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric(label="🎯 Precisión Total", value=f"{precision_llamada}%" if precision_llamada!='N/A' else 'N/A')
            st.metric(label="👤 Error Crítico Cliente", value=precision_cliente)
        with col2:
            st.metric(label="💼 Error Crítico Negocio", value=precision_negocio)
            st.metric(label="⚖️ Error Crítico Cumplimiento", value=precision_cumplimiento)
        with col3:
            st.metric(label="⚠️ Error No Crítico", value=precision_no_critico)
            if id_cliente!='N/A': st.info(f"🆔 **ID Cliente:** {id_cliente}")
            if fecha_llamada!='N/A': st.info(f"📅 **Fecha:** {fecha_llamada}")

        st.markdown("---")
        # Mostrar Audio y Transcripción
        with st.container():
            st.subheader("🔊 Audio de la llamada")
            gcs_uri = datos_llamada.get('id_original_path')
            if gcs_uri:
                match = re.match(r'gs://([^/]+)/(.+)', gcs_uri)
                if match:
                    bucket_name, blob_name = match.groups()
                    client = storage.Client()
                    bucket = client.bucket(bucket_name)
                    blob = bucket.blob(blob_name)
                    audio_bytes = blob.download_as_bytes()
                    st.audio(audio_bytes, format='audio/mp3')
            else:
                st.info("No hay ruta de audio disponible.")
            st.subheader("📜 Transcripción de la llamada")
            st.code(transcripcion_texto, language='text')

        st.markdown("---")
        # Mostrar Evaluación sin métricas
        eval_dict_sin_metricas = eval_dict.copy()
        for metrica in ['precision_error_critico_cliente','precision_error_critico_negocio','precision_error_critico_cumplimiento','precision_error_no_critico','precision_llamada']:
            eval_dict_sin_metricas.pop(metrica,None)
        with st.container():
            st.subheader("✅ Evaluación de Calidad (JSON)")
            st.json(eval_dict_sin_metricas)

    # --- Lógica principal del Monitor de Evaluaciones ---
    df_resultados = load_data(DATA_PATH)

    if df_resultados is not None:
        llamadas_validas = df_resultados[df_resultados['evaluacion_llamada_raw'].notna()]
        llamadas_id = llamadas_validas['id_llamada_procesada'].dropna().tolist()

        if not llamadas_id:
            st.warning("No se encontraron llamadas procesadas correctamente en el archivo.")
            st.sidebar.selectbox("🎧 Selecciona una llamada", ["No hay llamadas para mostrar"], disabled=True)
        else:
            # Selector de llamada en el sidebar
            llamada_seleccionada_id = st.sidebar.selectbox("🎧 Selecciona una llamada", llamadas_id)
            
            # Información adicional en el sidebar
            st.sidebar.markdown("---")
            st.sidebar.markdown("### 📊 Estadísticas")
            st.sidebar.info(f"**Total de llamadas:** {len(llamadas_id)}")
            st.sidebar.info(f"**Dataset actual:** {selected_dataset}")
            
            # Mostrar contenido principal
            if llamada_seleccionada_id:
                datos_llamada = llamadas_validas[llamadas_validas.id_llamada_procesada == llamada_seleccionada_id].iloc[0]
                mostrar_detalles_llamada(datos_llamada)
            else:
                st.info("⬅️ Selecciona una llamada de la lista para ver su análisis.")
    else:
        st.sidebar.selectbox("🎧 Selecciona una llamada", ["Error al cargar datos"], disabled=True)
        st.error("No se pudieron cargar los datos. Verifique la configuración.")

elif menu_option == "🎤 Procesamiento de Audio":
    
    # --- Funciones para el procesamiento de audio ---
    def upload_to_gcs(file_bytes, filename, bucket_name, blob_path):
        """Sube un archivo a Google Cloud Storage y devuelve la URI de gs://"""
        try:
            client = storage.Client()
            bucket = client.bucket(bucket_name)
            blob = bucket.blob(blob_path)
            
            # Subir el archivo
            blob.upload_from_string(file_bytes, content_type='audio/mpeg')
            
            # Retornar la URI de GCS
            return f"gs://{bucket_name}/{blob_path}"
        except Exception as e:
            st.error(f"Error al subir archivo a GCS: {e}")
            return None

    def process_audio_with_gemini(audio_uri):
        """Procesa el audio usando el modelo Gemini-2.5-pro"""
        try:
            # Configurar cliente de Gemini
            client = genai.Client(vertexai=True, project="augusta-bbog-dev-activo", location="global", 
                                 http_options=types.HttpOptions(api_version="v1"))
            
            # Crear objeto Part desde la URI
            audio_file_genai = types.Part.from_uri(file_uri=audio_uri, mime_type="audio/mpeg")
            
            # Prompt de transcripción
            prompt_transcripcion = """
            Rol: Eres un sistema de transcripción de alta fidelidad, especializado en entornos de call center complejos. Actúas como un "oído entrenado", capaz de discernir entre hablantes humanos, sistemas automáticos y ruidos relevantes.
            
            Tarea: Generar una transcripción y diarización ultra precisa del audio proporcionado, siguiendo estrictamente el protocolo de etiquetado definido, con formato de timecode.
            
            ---
            
            ### Protocolo de Transcripción Detallado ###
            
            **1. Identificación de Hablantes (Etiquetas obligatorias):**  
            Usa **solo** las siguientes etiquetas al inicio de cada línea:
            
            - `Agente:` → Empleado del call center.  
            - `Cliente:` → Persona que recibe o realiza la llamada.  
            - `Sistema:` → Mensajes automáticos, música de espera, o voces del sistema telefónico.
            
            **2. Eventos de Audio y Ruido (Detección selectiva):**  
            Tu foco es capturar únicamente los elementos que sean **relevantes para la interacción principal**.
            
            **Incluye los siguientes eventos usando corchetes `[]`:**
            
            - `[silencio prolongado]`:  
              - **Este marcador solo debe usarse cuando exista un silencio real, continuo y no justificado de al menos 20 segundos.**  
              - **NO marques pausas normales entre frases, respiraciones, búsquedas breves de información, o espacios de menos de 20 segundos.**  
              - **Muchos sistemas cometen el error de etiquetar como "silencio" espacios naturales del habla: tú NO debes cometer ese error.**  
              - Si tienes duda sobre si fue un silencio real y prolongado, **no lo marques**.
            
            - `[suspiro]`, `[sollozo]`, `[risa]`, `[tos]`: Reacciones físicas o emocionales audibles.
            - `[tecleo de computador]`: Solo si es evidente y relevante.
            - `[ininteligible]`: Cuando una palabra o frase no es comprensible.
            - `[conversaciones de fondo]`: Si hay voces audibles que claramente no son parte de la conversación principal.
            - `[transmite a encuesta]`: Si el agente lo indica explícitamente.
            - `[superposición de voces]`: Cuando hay cruce simultáneo que impide entender lo dicho.
            
            **NO INCLUYAS:**
            
            - Ruidos lejanos o irrelevantes (tráfico, ambiente de oficina).
            - Conversaciones de fondo **si no son comprensibles** o no interfieren en la conversación.
            - Música o sonidos ambientales leves.
            
            ---
            
            ### 3. Reglas de Formato de Salida (Obligatorio):
            
            - Cada línea debe comenzar con el `timecode` entre corchetes `[MM:SS]`, seguido de la etiqueta (`Agente:`, `Cliente:`, `Sistema:`), un espacio y el texto.
            - La transcripción debe ser literal, palabra por palabra, en español colombiano.
            - No utilices formato Markdown.
            - No incluyas resúmenes ni explicaciones.
            - **NO transcribas contenido de personas de fondo. Si se escucha gente hablando, solo indica `[conversaciones de fondo]` si es claramente audible, sin incluir lo que dicen.**
            - Si la llamada termina abruptamente sin despedida del agente, **asume que el cliente colgó.**
            
            ---
            
            ### Formato Esperado (Ejemplo literal):
            
            [00:01] Agente: Buenos días, le saluda Carlos del Banco de Bogotá. ¿Hablo con la señora Ana?
            [00:04] Cliente: Sí, con ella.
            [00:07] Agente: Señora Ana, el motivo de mi llamada es sobre su tarjeta de crédito. Permítame un momento mientras valido la información.
            [00:11] Agente: [tecleo de computador]
            [00:15] Sistema: Su llamada es importante para nosotros. Gracias por su paciencia. [música de espera suave]
            [00:20] Cliente: [suspiro] Ok...
            [00:25] [conversaciones de fondo]
            [00:28] Agente: Gracias por la espera, señora Ana. Verifico que presenta una mora de...
            [00:32] [superposición de voces]
            [00:35] Cliente: Eh... sí, es que he tenido algunos problemas económicos.
            [00:41] Agente: [transmite a encuesta] La remito a una breve encuesta...
            
            El audio corresponde a una llamada de cobranzas del Banco de Bogotá. Procede ahora con la transcripción del audio adjunto, aplicando **rigurosamente** las reglas anteriores.  
            **Recuerda: marcar incorrectamente un silencio cuando no lo hay es un error crítico. Solo marca silencios prolongados reales de más de 20 segundos.**
            """
            
            # Configuración para la generación
            generate_content_config = types.GenerateContentConfig(
                audio_timestamp=True,
                temperature=0.7,
                top_p=1,
                thinking_config=types.ThinkingConfig(thinking_budget=-1)
            )
            
            # Generar transcripción
            respuesta_transcripcion = client.models.generate_content(
                model='gemini-2.5-pro',
                contents=[prompt_transcripcion, audio_file_genai], 
                config=generate_content_config
            )
            
            return respuesta_transcripcion.text
            
        except Exception as e:
            st.error(f"Error al procesar audio con Gemini: {e}")
            return None

    # --- Interfaz de usuario para procesamiento de audio ---
    st.header("🎤 Procesamiento de Audio para Cobranzas")
    st.markdown("---")
    
    # Información en el sidebar
    st.sidebar.markdown("### ⚙️ Configuración")
    st.sidebar.info("""
    **Bucket GCS:** augusta-bbog-dev-sandbox  
    **Ruta:** casos-uso/monitor-cobranzas/cobranzas-transcripcion/  
    **Modelo:** Gemini-2.5-pro
    """)
    
    # Instrucciones
    st.info("""
    📋 **Instrucciones:**
    1. Sube un archivo de audio (formato MP3) de una llamada de cobranzas
    2. El archivo se guardará automáticamente en Google Cloud Storage
    3. Se procesará con el modelo Gemini-2.5-pro para generar la transcripción
    4. Podrás ver los resultados de la transcripción en tiempo real
    """)
    
    # Subida de archivo
    uploaded_file = st.file_uploader(
        "Selecciona un archivo de audio",
        type=['mp3', 'wav', 'm4a'],
        help="Formatos soportados: MP3, WAV, M4A"
    )
    
    if uploaded_file is not None:
        # Mostrar información del archivo
        st.success(f"✅ Archivo cargado: {uploaded_file.name}")
        st.write(f"**Tamaño:** {uploaded_file.size / 1024 / 1024:.2f} MB")
        
        # Reproducir audio
        st.subheader("🔊 Reproducir Audio")
        st.audio(uploaded_file, format='audio/mp3')
        
        # Botón para procesar
        col1, col2, col3 = st.columns([1, 2, 1])
        with col2:
            if st.button("🚀 Procesar Audio", type="primary", use_container_width=True):
                # Crear nombre único para el archivo
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"audio_transcripcion_{timestamp}_{uploaded_file.name}"
                blob_path = f"casos-uso/monitor-cobranzas/cobranzas-transcripcion/{filename}"
                
                # Mostrar progreso
                progress_bar = st.progress(0)
                status_text = st.empty()
                
                # Paso 1: Subir a GCS
                status_text.text("📤 Subiendo archivo a Google Cloud Storage...")
                progress_bar.progress(25)
                
                # Leer bytes del archivo
                file_bytes = uploaded_file.read()
                
                # Subir a GCS
                audio_uri = upload_to_gcs(
                    file_bytes, 
                    filename, 
                    "augusta-bbog-dev-sandbox", 
                    blob_path
                )
                
                if audio_uri:
                    progress_bar.progress(50)
                    status_text.text("✅ Archivo subido exitosamente a GCS")
                    st.success(f"**URI generada:** `{audio_uri}`")
                    
                    # Paso 2: Procesar con Gemini
                    status_text.text("🤖 Procesando audio con Gemini-2.5-pro...")
                    progress_bar.progress(75)
                    
                    transcripcion = process_audio_with_gemini(audio_uri)
                    
                    if transcripcion:
                        progress_bar.progress(100)
                        status_text.text("✅ Procesamiento completado")
                        
                        # Mostrar resultados
                        st.markdown("---")
                        st.subheader("📋 Resultados de la Transcripción")
                        
                        # Información del procesamiento
                        with st.expander("ℹ️ Información del Procesamiento", expanded=True):
                            st.write(f"**Archivo:** {uploaded_file.name}")
                            st.write(f"**URI en GCS:** `{audio_uri}`")
                            st.write(f"**Fecha de procesamiento:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                        
                        # Transcripción
                        st.subheader("📝 Transcripción Generada")
                        st.code(transcripcion, language='text')
                        
                        # Botón para descargar transcripción
                        st.download_button(
                            label="💾 Descargar Transcripción",
                            data=transcripcion,
                            file_name=f"transcripcion_{timestamp}.txt",
                            mime="text/plain"
                        )
                        
                        # Guardar en sesión para uso posterior
                        st.session_state['last_transcription'] = {
                            'filename': uploaded_file.name,
                            'uri': audio_uri,
                            'transcription': transcripcion,
                            'timestamp': timestamp
                        }
                        
                    else:
                        progress_bar.progress(0)
                        status_text.text("❌ Error en el procesamiento")
                else:
                    progress_bar.progress(0)
                    status_text.text("❌ Error al subir archivo a GCS")
    
    # Mostrar historial si existe
    if 'last_transcription' in st.session_state:
        st.markdown("---")
        st.subheader("📚 Última Transcripción Procesada")
        
        last = st.session_state['last_transcription']
        with st.expander(f"📄 {last['filename']} - {last['timestamp']}", expanded=False):
            st.write(f"**URI:** `{last['uri']}`")
            st.code(last['transcription'], language='text')
    else:
        st.info("Aún no has procesado ningún audio en esta sesión.")

elif menu_option == "💬 Chat Interactivo":
    # Ejecutar sección de Chat Interactivo (modo 'chat')
    # Selección de fuente de datos y límite de registros para el chat
    st.sidebar.markdown("### ⚙️ Configuración Chat Interactivo")
    chat_file_options = {
        "Servicios": "/home/ec2-user/data-bbog-integration-monitor-assistant/data/resultados_evaluaciones_servicios_servicios.json",
        "Preferente": "/home/ec2-user/data-bbog-integration-monitor-assistant/data/resultados_evaluaciones_servicios_preferente.json",
        "Retención": "/home/ec2-user/data-bbog-integration-monitor-assistant/data/resultados_evaluaciones_servicios_retencion.json",
        "Bloqueos": "/home/ec2-user/data-bbog-integration-monitor-assistant/data/resultados_evaluaciones_servicios_bloqueos.json"
    }
    selected_dataset = st.sidebar.selectbox(
        "Fuente de datos",
        options=list(chat_file_options.keys()),
        index=0,
        key="chat_dataset"
    )
    record_limit = st.sidebar.number_input(
        "Límite de registros a usar",
        min_value=1,
        max_value=1000,
        value=500,
        step=50,
        key="chat_limit"
    )
    # Pasar configuración al script v2
    import os
    globals()['MODE'] = 'chat'
    globals()['CHAT_DATASET'] = selected_dataset
    globals()['CHAT_LIMIT'] = record_limit
    v2_path = os.path.join(os.path.dirname(__file__), 'chat_servicios_v2.py')
    with open(v2_path, 'r', encoding='utf-8') as f:
        exec(f.read(), globals())
elif menu_option == "📊 Generador de Informes":
    # Ejecutar sección de Generador de Informes (modo 'report')
    # Selección de fuente de datos y límite de registros para el generador de informes
    st.sidebar.markdown("### ⚙️ Configuración Generador de Informes")
    report_file_options = {
        "Servicios": "/home/ec2-user/data-bbog-integration-monitor-assistant/data/resultados_evaluaciones_servicios_servicios.json",
        "Preferente": "/home/ec2-user/data-bbog-integration-monitor-assistant/data/resultados_evaluaciones_servicios_preferente.json",
        "Retención": "/home/ec2-user/data-bbog-integration-monitor-assistant/data/resultados_evaluaciones_servicios_retencion.json",
        "Bloqueos": "/home/ec2-user/data-bbog-integration-monitor-assistant/data/resultados_evaluaciones_servicios_bloqueos.json"
    }
    selected_report_dataset = st.sidebar.selectbox(
        "Fuente de datos",
        options=list(report_file_options.keys()),
        index=0,
        key="report_dataset"
    )
    report_limit = st.sidebar.number_input(
        "Límite de registros a usar",
        min_value=1,
        max_value=1000,
        value=500,
        step=50,
        key="report_limit"
    )
    # Pasar configuración al script v2
    import os
    globals()['MODE'] = 'report'
    globals()['REPORT_DATASET'] = selected_report_dataset
    globals()['REPORT_LIMIT'] = report_limit
    v2_path = os.path.join(os.path.dirname(__file__), 'chat_servicios_v2.py')
    with open(v2_path, 'r', encoding='utf-8') as f:
        exec(f.read(), globals())
elif menu_option == "📈 Reportes BI":
    # Mostrar un iframe embebido con reporte BI en HTML
    # Embed responsive Looker Studio report filling available width
    iframe_url = "https://lookerstudio.google.com/embed/reporting/73cef5c2-3137-4031-aa01-b47b8cc65a3e/page/yJkVF"
    # Sección de Reportes BI: iframe responsivo junto al menú lateral
    iframe_url = "https://lookerstudio.google.com/embed/reporting/73cef5c2-3137-4031-aa01-b47b8cc65a3e/page/yJkVF"
    # Crear iframe que ocupe el 100% del ancho del contenedor principal
    html = f"""
        <iframe src="{iframe_url}" width="100%" height="1200" style="border:0;">
        </iframe>
    """
    components.html(html, height=1200)
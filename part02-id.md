### Agen Dinamis

Cara paling sederhana untuk mengonfigurasi agen adalah dengan memberikan string untuk system prompt mereka, string untuk penyedia dan nama model, serta objek/kamus untuk daftar alat yang disediakan.

Tapi itu menciptakan tantangan. Bagaimana jika Anda ingin mengubah hal-hal ini saat runtime?

#### Apa itu Agen Dinamis?

Memilih antara agen dinamis dan statis pada akhirnya adalah pertukaran antara prediktabilitas dan kekuatan.

Agen dinamis adalah agen yang propertinya—seperti instruksi, model, dan alat yang tersedia—dapat ditentukan saat runtime, bukan hanya saat agen dibuat.

Ini berarti agen Anda dapat mengubah cara bertindaknya berdasarkan input pengguna, lingkungan, atau konteks runtime lain yang Anda berikan.

#### Contoh: Membuat Agen Dinamis

Berikut contoh agen dukungan dinamis yang menyesuaikan perilakunya berdasarkan tier langganan pengguna dan preferensi bahasa:

```javascript
const supportAgent = new Agent({
  name: "Dynamic Support Agent",

  instructions: async ({ runtimeContext }) => {
    const userTier = runtimeContext.get("user-tier")
    const language = runtimeContext.get("language")

    return `You are a customer support agent for our SaaS platform.
The current user is on the ${userTier} tier and prefers ${language}
language.

For ${userTier} tier users:
${userTier === "free" ? "- Provide basic support and documentation links" : ""}
${userTier === "pro" ? "- Offer detailed technical support and best practices" : ""}
${userTier === "enterprise" ? "- Provide priority support with custom solutions" : ""}

Always respond in ${language} language.`
  },

  model: ({ runtimeContext }) => {
    const userTier = runtimeContext.get("user-tier")
    return userTier === "enterprise" ? openai("gpt-4") : openai("gpt-3.5-turbo")
  },

  tools: ({ runtimeContext }) => {
    const userTier = runtimeContext.get("user-tier")
    const baseTools = [knowledgeBase, ticketSystem]

    if (userTier === "pro" || userTier === "enterprise") {
      baseTools.push(advancedAnalytics)
    }

    if (userTier === "enterprise") {
      baseTools.push(customIntegration)
    }

    return baseTools
  },
})
```

### Middleware Agen

Setelah kita melihat bahwa berguna untuk menentukan system prompt, model, dan opsi alat saat runtime, kita mulai memikirkan hal lain yang mungkin ingin kita lakukan saat runtime juga.

#### Guardrails

_Guardrails_ adalah istilah umum untuk membersihkan input yang masuk ke agen Anda, atau output yang keluar. Sanitasi input secara luas mencoba melindungi dari serangan "prompt injection".

Ini termasuk "jailbreaking" model ("IGNORE PREVIOUS INSTRUCTIONS AND..."), permintaan untuk PII, dan chat di luar topik yang dapat menaikkan tagihan LLM Anda.

Untungnya, selama beberapa tahun terakhir, model semakin baik dalam melindungi dari input berbahaya; contoh prompt injection yang paling diingat berasal dari beberapa tahun lalu.

![image56](images/image56.jpg)

#### Autentikasi dan otorisasi agen

Ada dua lapisan izin yang perlu dipertimbangkan untuk agen.

Pertama, perizinan sumber daya mana yang harus diakses agen. Kedua, perizinan tentang pengguna mana yang dapat _mengakses_ agen.

Yang pertama telah kita bahas di bagian sebelumnya; yang kedua akan kita diskusikan di sini. Middleware adalah tempat yang umum untuk menempatkan otorisasi agen apa pun, karena berada di perimeter di sekitar agen daripada di dalam loop internal agen.

Satu hal yang perlu dipikirkan saat membangun agen adalah karena mereka lebih kuat daripada pola akses data pra-LLM, Anda mungkin perlu menghabiskan lebih banyak waktu memastikan mereka _diizinkan secara akurat_.

Keamanan melalui ketidakjelasan menjadi kurang layak ketika pengguna dapat meminta agen untuk mengambil pengetahuan yang tersembunyi di sudut dan celah.

---

## BAGIAN III: ALAT & MCP

### Alat Pihak Ketiga Populer

Agen hanya sekuat alat yang Anda berikan kepada mereka. Akibatnya, ekosistem telah muncul di sekitar jenis alat populer.

#### Web scraping & penggunaan komputer

Salah satu kasus penggunaan alat inti untuk agen adalah penggunaan browser.

Ini termasuk web scraping, dan mengotomatiskan tugas browser, dan mengekstrak informasi. Anda dapat menggunakan alat bawaan, terhubung ke server MCP, atau mengintegrasikan dengan platform otomasi tingkat tinggi.

Ada beberapa alat berbeda yang dapat Anda gunakan untuk menambahkan pencarian ke agen Anda:

**API pencarian web berbasis cloud.** Ada beberapa API pencarian web yang telah menjadi populer untuk digunakan LLM, termasuk Exa, Browserbase, dan Tavily.

**Alat pencarian open-source tingkat rendah.** Proyek Playwright milik Microsoft adalah proyek era pra-LLM yang menawarkan kemampuan pencarian web.

**Pencarian web agentik.** Alat seperti Stagehand (di JavaScript) dan Browser Use (di Python, dengan server MCP untuk pengguna JS) memiliki API bahasa Inggris sederhana yang dapat Anda gunakan untuk menggambarkan tugas web scraping. Ketika Anda menyediakan alat browser kepada agen, Anda sering menemui tantangan serupa dengan otomasi browser tradisional.

- **Deteksi anti-bot.** Mulai dari fingerprinting browser hingga WAF hingga captcha, banyak situs web melindungi dari lalu lintas otomatis.
- **Setup rapuh.** Setup penggunaan browser terkadang rusak jika situs web target mengubah tata letak atau memodifikasi beberapa CSS.

Tantangan ini dapat diatasi — cukup alokasikan sedikit waktu untuk beberapa pekerjaan pembersihan dan perekatan!

#### Integrasi pihak ketiga

Hal lain yang dibutuhkan agen adalah koneksi ke sistem di mana data pengguna berada — termasuk kemampuan untuk membaca dan menulis dari sistem tersebut.

Sebagian besar agen — seperti sebagian besar SaaS — perlu mengakses seperangkat integrasi _umum_ inti (seperti email, kalender, dokumen).

Akan sulit, misalnya, membangun agen asisten pribadi tanpa akses ke Gmail, Google Calendar, atau Microsoft Outlook.

Selain itu, tergantung pada domain yang Anda bangun, Anda akan membutuhkan integrasi tambahan.

Agen penjualan Anda perlu berintegrasi dengan Salesforce dan Gong. Agen SDM Anda perlu berintegrasi dengan Rippling dan Workday. Agen kode Anda perlu berintegrasi dengan Github dan Jira.

Dan seterusnya.

Kebanyakan orang yang membangun agen ingin menghindari menghabiskan berbulan-bulan membangun integrasi standar yang membosankan, dan memilih "agentic iPaas" (integration-platform-as-a-service).

Perbedaan utama adalah antara opsi yang lebih ramah pengembang dengan paket pro puluhan dan ratusan dolar per bulan, dan opsi yang lebih "enterprise" dengan integrasi yang terkadang lebih dalam dalam ribuan dolar per bulan.

Di kubu pertama, kami melihat orang-orang senang dengan Composio, Pipedream, dan Apify.

Di kubu kedua, ada berbagai solusi khusus; kami tidak memiliki cukup data untuk menawarkan saran umum yang baik.

### Model Context Protocol (MCP): Menghubungkan Agen dan Alat

Alat.

LLM, seperti manusia, menjadi jauh lebih kuat ketika diberikan alat. MCP menyediakan cara standar untuk memberi model akses ke alat.

#### Apa itu MCP

Pada November 2024, tim kecil di Anthropic mengusulkan MCP sebagai protokol untuk memecahkan masalah nyata: setiap penyedia AI dan pembuat alat memiliki cara mereka sendiri untuk mendefinisikan dan memanggil alat.

Anda dapat menganggap MCP seperti port USB-C untuk aplikasi AI.

Ini adalah protokol terbuka untuk menghubungkan agen AI ke alat, model, dan satu sama lain. Anggap sebagai adapter universal: jika alat atau agen Anda "berbicara" MCP, itu dapat terhubung ke sistem lain yang kompatibel dengan MCP — tidak peduli siapa yang membangunnya atau bahasa apa yang ditulisnya.

Tapi seperti yang diketahui oleh insinyur berpengalaman, kekuatan protokol apa pun ada di jaringan orang yang mengikutinya.

Meskipun awalnya diterima dengan baik, butuh waktu hingga Maret untuk MCP mencapai massa kritis pada Maret, setelah mendapatkan popularitas di antara pendukung vokal terkemuka seperti CEO Shopify Tobi Lutke.

Pada April, OpenAI dan Google Gemini mengumumkan mereka akan mendukung MCP, menjadikannya default.

#### Primitif MCP

MCP memiliki dua primitif dasar: _server_ dan _klien_.

**Server** membungkus set alat MCP. Mereka (dan alat dasarnya) dapat ditulis dalam bahasa apa pun dan berkomunikasi dengan klien melalui HTTP.

**Klien** seperti model atau agen dapat meng-query server untuk mendapatkan set alat yang disediakan, lalu meminta server mengeksekusi alat dan mengembalikan respons.

Dengan demikian, MCP adalah standar untuk eksekusi kode jarak jauh, seperti OpenAPI atau RPC.

#### Ekosistem MCP

Ketika MCP mendapatkan daya tarik, banyak orang bergabung.

- **Vendor** seperti Stripe mulai mengirimkan server MCP untuk fungsionalitas API mereka.
- **Pengembang independen** mulai membuat server MCP untuk fungsionalitas yang mereka butuhkan, seperti penggunaan browser atau, dan mempublikasikannya di Github.
- **Registri** seperti Smithery, PulseMCP, dan mcp.run muncul untuk mengkatalogkan ekosistem server yang berkembang (serta memvalidasi kualitas dan keamanan penyedia).
- **Framework** seperti Mastra mulai mengirimkan abstraksi server dan klien MCP sehingga pengembang individu tidak harus mengimplementasikan spesifikasi sendiri.

#### Kapan menggunakan MCP

Agen, seperti SaaS, sering membutuhkan sejumlah integrasi dasar dengan layanan pihak ketiga (kalender, chat, email, web). Jika roadmap Anda memiliki banyak fitur semacam ini, ada baiknya melihat membangun _klien_ MCP yang dapat mengakses fitur pihak ketiga.

Sebaliknya, jika Anda membangun alat yang ingin digunakan oleh agen _lain_, Anda harus mempertimbangkan untuk mengirimkan _server_ MCP.

#### Membangun Server dan Klien MCP

Jika Anda ingin membuat server MCP dan memberi agen akses ke mereka, berikut cara Anda melakukannya di TypeScript dengan Mastra:

```typescript
// --- weatherTool.ts ---
import { defineTool } from "@mastra/core/tool"

export const weatherTool = defineTool({
  name: "weatherTool",
  description: "Get the current weather for a city.",
  parameters: {
    city: { type: "string", description: "City name" },
  },
  async execute({ city }) {
    // Dummy Implementation
    return `The weather in ${city} is sunny!`
  },
})

// --- weather-server.ts ---
import { MCPServer } from "@mastra/mcp"
import { weatherTool } from "./weatherTool"

const server = new MCPServer({
  name: "Weather Server",
  version: "1.0.0",
  tools: [weatherTool],
})

await server.startStdio()

// --- agent.ts ---
import { MCPClient } from "@mastra/mcp"
import { Agent } from "@mastra/core/agent"
import { openai } from "@ai-sdk/openai"

const mcp = new MCPClient({
  servers: {
    weather: {
      command: "npx",
      args: ["tsx", "weather-server.ts"],
      timeout: 30000,
    },
  },
})

const agent = new Agent({
  name: "Weather Agent",
  instructions: "You can answer weather questions using the weather tool.",
  model: openai("gpt-4"),
  tools: await mcp.getTools(),
})
```

Sebaliknya, jika Anda ingin membuat klien dengan akses ke server MCP lain, berikut cara Anda melakukannya:

```typescript
import { MCPClient, MCPServer } from "@mastra/mcp"

// Step 1: Create an MCP client that connects to other MCP servers
const mcp = new MCPClient({
  servers: {
    weather: {
      // Connect to a remote MCP server via HTTP/SSE
      url: new URL("http://localhost:1234/sse"),
    },
    stocks: {
      // Or connect to a local MCP server via stdio
      command: "npx",
      args: ["tsx", "stock-server.ts"],
    },
  },
  timeout: 30000,
})

// Step 2: Expose all tools from the connected MCP servers via a new
// MCPServer
const server = new MCPServer({
  name: "Proxy MCP Server",
  version: "1.0.0",
  tools: await mcp.getTools(), // Aggregate tools from all connected servers
})

// Step 3: Start the proxy MCP server (stdio)
await server.startStdio()
```

#### Apa berikutnya untuk MCP

MCP sebagai protokol secara teknis mengesankan, tetapi ekosistem masih berusaha menyelesaikan beberapa tantangan:

**Pertama, penemuan.** Tidak ada cara terpusat atau standar untuk menemukan alat MCP. Meskipun berbagai registri telah muncul, ini menciptakan fragmentasi sendiri.

Pada April, kami agak bercanda membangun Registry Registry MCP pertama, tetapi Anthropic sebenarnya sedang mengerjakan meta-registry.

**Kedua, kualitas.** Belum ada yang setara (belum) dengan skor paket atau lencana verifikasi NPM. Namun, registri (yang dengan cepat mengumpulkan pendanaan ventura) bekerja keras untuk ini.

**Ketiga, konfigurasi.** Setiap penyedia memiliki skema konfigurasi dan API mereka sendiri. Spesifikasi MCP panjang, dan klien tidak selalu mengimplementasikannya sepenuhnya.

#### Kesimpulan

Anda dapat dengan mudah menghabiskan akhir pekan mendebug perbedaan halus antara cara Cursor dan Windsurf mengimplementasikan klien MCP mereka (dan kami melakukannya).

Ada alpha dalam bermain-main dengan MCP, tetapi Anda mungkin tidak ingin membuat sendiri, setidaknya tidak sekarang. Cari framework atau library yang bagus dalam bahasa Anda.

---

## BAGIAN IV: WORKFLOW BERBASIS GRAPH

### Workflow 101

Kami telah melihat bagaimana agen individu dapat bekerja.

Di setiap langkah, agen memiliki fleksibilitas untuk memanggil alat (fungsi) apa pun.

Terkadang, kebebasan ini terlalu banyak.

Workflow berbasis graph telah muncul sebagai teknik yang berguna untuk membangun dengan LLM ketika agen tidak memberikan output yang cukup terprediksi.

Terkadang, Anda harus memecah masalah, mendefinisikan pohon keputusan, dan membuat agen (atau beberapa agen) membuat beberapa keputusan biner daripada satu keputusan besar.

Primitif workflow berguna untuk mendefinisikan logika percabangan, eksekusi paralel, checkpoint, dan menambahkan tracing.

Mari kita selami.

### Percabangan, Rantai, Penggabungan, Kondisi

Jadi, apa cara terbaik untuk membangun graph workflow?

Mari kita jalani operasi dasar, dan kemudian kita bisa sampai ke praktik terbaik.

#### Percabangan

Satu kasus penggunaan untuk percabangan adalah memicu beberapa panggilan LLM pada input yang sama.

Misalkan Anda memiliki rekam medis panjang, dan perlu memeriksa keberadaan 12 gejala berbeda (kantuk, mual, dll).

Anda dapat memiliki satu panggilan LLM memeriksa 12 gejala. Tapi itu terlalu banyak.

Lebih baik memiliki 12 panggilan LLM paralel, masing-masing memeriksa satu gejala.
Di Mastra, Anda membuat cabang dengan perintah `.step()`. Berikut contoh sederhana:

![image23](images/image23.png)

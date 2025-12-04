### Agen Dinamis

Cara paling sederhana untuk mengkonfigurasi agen adalah dengan meneruskan string untuk _system prompt_-nya, string untuk nama penyedia dan model, dan objek/kamus untuk daftar alat (_tools_) yang disediakan untuknya.

Namun, itu menciptakan sebuah tantangan. Bagaimana jika Anda ingin mengubah hal-hal ini saat runtime?

#### Apa itu Agen Dinamis?

Memilih antara **agen dinamis** dan **agen statis** pada akhirnya merupakan pertukaran antara **prediktabilitas** dan **kekuatan**.

Agen dinamis adalah agen yang propertinya—seperti instruksi, model, dan alat yang tersedia—dapat ditentukan saat _runtime_, bukan hanya saat agen dibuat.

Ini berarti agen Anda dapat mengubah cara ia bertindak berdasarkan input pengguna, lingkungan, atau konteks runtime lain yang Anda sediakan.

#### Contoh: Membuat Agen Dinamis

Berikut adalah contoh agen dukungan dinamis yang menyesuaikan perilakunya berdasarkan tingkatan langganan dan preferensii bahasa pengguna:

```javascript
const supportAgent = new Agent({
  name: "Dynamic Support Agent",

  instructions: async ({ runtimeContext }) => {
    const userTier = runtimeContext.get("user-tier")
    const language = runtimeContext.get("language")

    return
`Anda adalah agen dukungan pelanggan untuk platform SaaS kami.
Pengguna saat ini berada di tingkatan ${userTier} dan lebih memilih bahasa ${language}.
`Untuk pengguna tingkatan ${userTier} :
${userTier === "free" ? "- Berikan dukungan dasar dan tautan dokumentasi" : ""}
`{userTier === "pro" ? "- Tawarkan dukungan teknis terperinci dan praktik terbaik" : ""}
${userTier === "enterprise" ?
`- Berikan dukungan prioritas dengan solusi khusus" : ""}

Selalu balas dalam bahasa ${language}.`
  },

  model: ({ runtimeContext }) => {
    const userTier = runtimeContext.get("user-tier")
    return userTier === "enterprise" ? openai("gpt-
`) : openai("gpt-3.5-turbo")
  },

  tools: ({ runtimeContext }) => {
    const userTier =
`untimeContext.get("user-tier")
    const baseTools = [knowledgeBase, ticketSystem]

    if (userTier === "pro" || userTier === "enterprise") {
      baseTools.push(advancedAnalytics)
    }

    if (userTier === "enterprise") {
`     baseTools.push(customIntegration)
    }

    return baseTools
  },
})
```

---

### Middleware Agen

Setelah kita melihat bahwa berguna untuk menentukan _system prompt_, model, dan opsi alat saat _runtime_, kita mulai memikirkan hal-hal lain yang mungkin ingin kita lakukan saat runtime juga.

#### Guardrails

**Guardrails** adalah istilah umum untuk membersihkan input yang masuk ke agen Anda, atau output yang keluar. Pembersihan input secara luas mencoba menjaga dari serangan **"prompt injection"**.

Ini termasuk "jailbreaking" model ("ABAIKAN INSTRUKSI SEBELUMNYA DAN..."), permintaan untuk PII, dan obrolan di luar topik yang dapat menghabiskan tagihan LLM Anda.

Untungnya, selama beberapa tahun terakhir, model menjadi lebih baik dalam menjaga dari input berbahaya; contoh _prompt injection_ yang paling berkesan adalah dari beberapa tahun yang lalu.

![image56](images/image56.jpg)

#### Otentikasi dan otorisasi agen

Ada dua lapisan izin (_permissions_) yang perlu dipertimbangkan untuk agen.

Pertama, perizinan tentang sumber daya mana yang harus diakses oleh agen. Kedua, perizinan tentang pengguna mana yang dapat **mengakses** agen.

Yang pertama kita bahas di bagian sebelumnya; yang kedua akan kita bahas di sini. **Middleware** adalah tempat yang khas untuk menempatkan otorisasi agen apa pun, karena berada di perimeter di sekitar agen daripada di dalam _inner loop_ agen.

Satu hal yang perlu dipikirkan saat membangun agen adalah karena mereka lebih kuat daripada pola akses data pra-LLM, Anda mungkin perlu menghabiskan lebih banyak waktu untuk memastikan mereka **diizinkan secara akurat**.

Keamanan melalui ketidakjelasan menjadi opsi yang kurang layak ketika pengguna dapat meminta agen untuk mengambil pengetahuan yang tersembunyi di sudut dan celah.

---

## BAGIAN III: ALAT & MCP

### Alat Pihak Ketiga yang Populer

Agen hanya sekuat alat yang Anda berikan kepada mereka. Akibatnya, ekosistem telah muncul di sekitar jenis alat yang populer.

#### Web scraping & penggunaan komputer

Salah satu kasus penggunaan alat inti untuk agen adalah penggunaan browser.

Ini termasuk **web scraping**, dan **mengotomatiskan tugas browser**, dan **mengekstrak informasi**. Anda dapat menggunakan alat bawaan, terhubung ke server MCP, atau berintegrasi dengan platform otomatisasi tingkat yang lebih tinggi.

Ada beberapa alat berbeda yang dapat Anda ambil untuk menambahkan pencarian ke agen Anda:

**API pencarian web berbasis cloud.** Ada beberapa API pencarian web yang menjadi populer untuk digunakan LLM, termasuk Exa, Browserbase, dan Tavily.

**Alat pencarian sumber terbuka tingkat rendah.** Proyek Playwright Microsoft adalah proyek era pra-LLM yang menawarkan kemampuan pencarian web.

**Pencarian web berbasis agen.** Alat seperti Stagehand (dalam JavaScript) dan Browser Use (dalam Python, dengan server MCP untuk pengguna JS) memiliki API bahasa Inggris biasa yang dapat Anda gunakan untuk menjelaskan tugas _web scraping_. Ketika Anda menyediakan alat browser untuk agen, Anda sering menghadapi tantangan yang mirip dengan otomatisasi browser tradisional.

- **Deteksi anti-bot.** Dari _browser fingerprinting_ hingga WAF hingga _captcha_, banyak situs web melindungi dari lalu lintas otomatis.
- **Pengaturan yang rapuh.** Pengaturan penggunaan browser terkadang rusak jika situs web target mengubah tata letak mereka atau memodifikasi beberapa CSS.

Tantangan-tantangan ini dapat diatasi — sisihkan sedikit waktu untuk beberapa pekerjaan **munging** dan **glue**!

#### Integrasi pihak ketiga

Hal lain yang dibutuhkan agen adalah koneksi ke sistem tempat data pengguna berada — termasuk kemampuan untuk membaca dan menulis dari sistem tersebut.

Sebagian besar agen — seperti kebanyakan SaaS — memerlukan akses ke serangkaian inti integrasi **umum** (seperti email, kalender, dokumen).

Akan sulit, misalnya, untuk membangun agen asisten pribadi tanpa akses ke Gmail, Google Calendar, atau Microsoft Outlook.

Selain itu, tergantung pada domain yang Anda bangun, Anda akan memerlukan integrasi tambahan.

Agen penjualan Anda perlu berintegrasi dengan Salesforce dan Gong. Agen HR Anda perlu berintegrasi dengan Rippling dan Workday. Agen kode Anda perlu berintegrasi dengan Github dan Jira.

Dan seterusnya.

Kebanyakan orang yang membangun agen ingin menghindari menghabiskan waktu berbulan-bulan untuk membangun integrasi standar, dan memilih **"agentic iPaas"** (_integration-platform-as-a-service_ berbasis agen).

Perbedaan utamanya adalah antara opsi yang lebih ramah pengembang dengan paket pro dalam puluhan dan ratusan dolar per bulan, dan opsi yang lebih **"enterprise"** dengan integrasi yang terkadang lebih dalam dalam ribuan dolar per bulan.

Di kubu yang pertama, kami telah melihat orang-orang senang dengan Composio, Pipedream, dan Apify.

Di kubu yang terakhir, ada berbagai solusi khusus; kami tidak memiliki cukup data untuk menawarkan saran umum yang baik.

### Model Context Protocol (MCP): Menghubungkan Agen dan Alat

Alat.

LLM, seperti manusia, menjadi jauh lebih kuat ketika diberi alat. **MCP** menyediakan cara standar untuk memberikan akses model ke alat.

#### Apa itu MCP

Pada November 2024, sebuah tim kecil di Anthropic mengusulkan MCP sebagai protokol untuk memecahkan masalah nyata: setiap penyedia AI dan pembuat alat memiliki cara mereka sendiri untuk mendefinisikan dan memanggil alat.

Anda dapat menganggap MCP seperti _port_ **USB-C untuk aplikasi AI**.

Ini adalah protokol terbuka untuk menghubungkan agen AI ke alat, model, dan satu sama lain. Anggap saja sebagai adaptor universal: jika alat atau agen Anda "berbicara" MCP, ia dapat terhubung ke sistem lain yang kompatibel dengan MCP — tidak peduli siapa yang membangunnya atau bahasa apa yang digunakan untuk menulisnya.

Tetapi seperti yang diketahui oleh insinyur berpengalaman mana pun, kekuatan protokol apa pun terletak pada jaringan orang yang mengikutinya.

Meskipun awalnya diterima dengan baik, butuh waktu hingga Maret bagi MCP mencapai massa kritis pada bulan Maret, setelah mendapatkan popularitas di kalangan pendukung terkemuka dan vokal seperti CEO Shopify, Tobi Lutke.

Pada bulan April, OpenAI dan Google Gemini mengumumkan bahwa mereka akan mendukung MCP, menjadikannya standar baku.

#### Primitif MCP

MCP memiliki dua primitif dasar: **server** dan **klien**.

**Server** membungkus serangkaian alat MCP. Mereka (dan alat dasarnya) dapat ditulis dalam bahasa apa pun dan berkomunikasi dengan klien melalui HTTP.

**Klien** seperti model atau agen dapat mengkueri server untuk mendapatkan serangkaian alat yang disediakan, kemudian meminta server untuk mengeksekusi alat dan mengembalikan respons.

Dengan demikian, MCP berfungsi sebagai standar untuk eksekusi kode jarak jauh, seperti OpenAPI atau RPC.

#### Ekosistem MCP

Saat MCP mendapatkan daya tarik, banyak orang bergabung.

- **Vendor** seperti Stripe mulai mengirimkan server MCP untuk fungsionalitas API mereka.
- **Pengembang independen** mulai membuat server MCP untuk fungsionalitas yang mereka butuhkan, seperti penggunaan browser, dan memublikasikannya di Github
- **Registri** seperti Smithery, PulseMCP, dan mcp.run bermunculan untuk membuat katalog ekosistem server yang berkembang (serta memvalidasi kualitas dan keamanan penyedia).
- **Kerangka kerja** seperti Mastra mulai mengirimkan abstraksi server dan klien MCP sehingga pengembang individu tidak perlu mengimplementasikan ulang spesifikasi itu sendiri.

#### Kapan menggunakan MCP

Agen, seperti SaaS, sering kali membutuhkan sejumlah integrasi dasar dengan layanan pihak ketiga (kalender, obrolan, email, web). Jika peta jalan Anda memiliki banyak fitur semacam ini, ada baiknya untuk melihat pembangunan **klien MCP** yang dapat mengakses fitur pihak ketiga.

Sebaliknya, jika Anda membangun alat yang Anda ingin agen **lain** gunakan, Anda harus mempertimbangkan untuk mengirimkan **server MCP**.

#### Membangun Server dan Klien MCP

Jika Anda ingin membuat server MCP dan memberikan akses agen ke sana, berikut cara Anda melakukannya di TypeScript dengan Mastra:

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

// Langkah 1: Buat klien MCP yang terhubung ke server MCP lain
const mcp = new MCPClient({
  servers: {
    weather: {
      // Terhubung ke server MCP jarak jauh melalui HTTP/SSE
      url: new URL("http://localhost:1234/sse"),
    },
    stocks: {
      // Atau terhubung ke server MCP lokal melalui stdio
      command: "npx",
      args: ["tsx", "stock-server.ts"],
    },
  },
  timeout: 30000,
})

// Langkah 2: Ekspos semua alat dari server MCP yang terhubung melalui MCPServer baru
const server = new MCPServer({
  name: "Proxy MCP Server",
  version: "1.0.0",
  tools: await mcp.getTools(), // Agregasikan alat dari semua server yang terhubung
})

// Langkah 3: Mulai server Proxy MCP (stdio)
await server.startStdio()
```

#### Apa selanjutnya untuk MCP

MCP sebagai protokol secara teknis mengesankan, tetapi ekosistem masih berupaya menyelesaikan beberapa tantangan:

**Pertama, penemuan (_discovery_).** Tidak ada cara terpusat atau terstandarisasi untuk menemukan alat MCP. Meskipun berbagai registri telah bermunculan, ini telah menciptakan jenis fragmentasi tersendiri.

Pada bulan April, kami agak bercanda membangun **Registri Registri MCP** yang pertama, tetapi Anthropic sebenarnya sedang mengerjakan _meta-registry_.

**Kedua, kualitas.** Belum ada padanan (belum) dari skor paket atau lencana verifikasi NPM. Meskipun demikian, registri (yang dengan cepat mengumpulkan pendanaan ventura) bekerja keras untuk ini.

**Ketiga, konfigurasi.** Setiap penyedia memiliki skema dan API konfigurasi sendiri. Spesifikasi MCP panjang, dan klien tidak selalu mengimplementasikannya sepenuhnya.

#### Kesimpulan

Anda dapat dengan mudah menghabiskan akhir pekan men-debug perbedaan halus antara cara Cursor dan Windsurf mengimplementasikan klien MCP mereka (dan kami melakukannya).

Ada **alpha** (_keuntungan_) dalam bermain-main dengan MCP, tetapi Anda mungkin tidak ingin membuatnya sendiri, setidaknya tidak saat ini. Cari kerangka kerja atau pustaka yang baik dalam bahasa Anda.

---

## BAGIAN IV: ALUR KERJA BERBASIS GRAFIK

### Alur Kerja 101

Kita telah melihat bagaimana agen individu dapat bekerja.

Pada setiap langkah, agen memiliki fleksibilitas untuk memanggil alat (fungsi) apa pun.

Terkadang, ini terlalu banyak kebebasan.

**Alur kerja berbasis grafik** telah muncul sebagai teknik yang berguna untuk membangun dengan LLM ketika agen tidak memberikan keluaran yang cukup terprediksi.

Terkadang, Anda hanya perlu memecah masalah, mendefinisikan pohon keputusan, dan meminta agen (atau agen-agen) membuat beberapa keputusan biner alih-alih satu keputusan besar.

Primitif alur kerja sangat membantu untuk mendefinisikan logika percabangan, eksekusi paralel, _checkpoint_, dan menambahkan pelacakan (_tracing_).

Mari kita selami.

### Percabangan, Perantaian, Penggabungan, Kondisi

Jadi, apa cara terbaik untuk membangun grafik alur kerja?

Mari kita bahas operasi dasar, dan kemudian kita bisa sampai pada praktik terbaik.

#### Percabangan (_Branching_)

Salah satu kasus penggunaan untuk percabangan adalah untuk memicu banyak panggilan LLM pada input yang sama.

Misalnya Anda memiliki catatan medis yang panjang, dan perlu memeriksa keberadaan 12 gejala yang berbeda (rasa kantuk, mual, dll).

Anda bisa memiliki satu panggilan LLM yang memeriksa 12 gejala. Tapi itu terlalu banyak untuk diminta.

Lebih baik memiliki **12 panggilan LLM paralel**, masing-masing memeriksa satu gejala.
Di Mastra, Anda membuat cabang dengan perintah `.step()`. Berikut adalah contoh sederhana:
![image23](images/image23.png)

# Prinsip-Prinsip Membangun Agen AI Edisi ke-2

_Versi Terbaru_

## Kata Pengantar

SAM BHAGWAT

Edisi ke-2

Dua bulan adalah waktu yang singkat untuk menulis edisi baru sebuah buku, tetapi kehidupan bergerak cepat di dunia AI.

Edisi ini memuat konten baru tentang MCP, pembuatan gambar (image gen), suara (voice), A2A, penelusuran web dan penggunaan komputer, streaming alur kerja, pembuatan kode (code generation), RAG berbasis agen (agentic RAG), dan deployment.

Rekayasa AI terus menjadi semakin populer. Unduhan mingguan Mastra telah berlipat ganda setiap dua bulan terakhir. Dalam pertemuan malam AI biasa di San Francisco, saya membagikan seratus eksemplar buku ini.

Kemudian dua hari yang lalu, buletin berita pengembang populer berkicau tentang buku ini dan 3.500 orang (!) mengunduh salinan digital (tersedia gratis di mastra.ai/book jika Anda membaca salinan kertas).

Jadi ya, 2025 benar-benar tahunnya agen. Terima kasih telah membaca, dan selamat membangun!

Sam Bhagwat San Francisco, CA Mei 2025

## Pengantar

Kami telah menyusun buku ini menjadi beberapa bagian berbeda.

**Meminta Model Bahasa Besar (LLM)** memberikan beberapa latar belakang tentang apa itu LLM, cara memilihnya, dan cara berbicara dengannya.

**Membangun Agen** memperkenalkan blok bangunan utama pengembangan AI. Agen adalah lapisan di atas LLM: mereka dapat menjalankan kode, menyimpan dan mengakses memori, dan berkomunikasi dengan agen lain. Chatbot biasanya didukung oleh agen.

**Alur Kerja Berbasis Grafik** telah muncul sebagai teknik yang berguna untuk membangun dengan LLM ketika agen tidak memberikan keluaran yang cukup terprediksi.

**Pembangkitan yang Ditingkatkan Retrieval (RAG)**, mencakup pola umum pencarian berbasis LLM. RAG membantu Anda mencari melalui korpus besar informasi (biasanya hak milik) untuk mengirimkan bagian yang relevan ke panggilan LLM tertentu.

**Sistem Multi-agen** mencakup aspek koordinasi dalam membawa agen ke produksi. Masalahnya sering kali melibatkan sejumlah besar desain organisasi!

**Pengujian dengan Evals** penting dalam memeriksa apakah aplikasi Anda memberikan kualitas yang memadai kepada pengguna.

**Pengembangan lokal dan deployment tanpa server (serverless deployment)** adalah dua tempat di mana kode Anda perlu berfungsi. Anda perlu dapat berulang dengan cepat di mesin Anda, kemudian membuat kode berjalan langsung di Internet.

Perhatikan bahwa kami tidak membahas topik pembelajaran mesin (ML) tradisional seperti pembelajaran penguatan (reinforcement learning), pelatihan model, dan penyetelan halus (fine-tuning).

Saat ini sebagian besar aplikasi AI hanya perlu _menggunakan_ LLM, daripada membangunnya.

---

## BAGIAN I: MEMINTA MODEL BAHASA BESAR (LLM)

### Sejarah Singkat LLM

AI telah menjadi teknologi abadi yang selalu ada di cakrawala selama lebih dari empat puluh tahun.

Ada kemajuan penting selama tahun 2000-an dan 2010-an: mesin catur, pengenalan ucapan, mobil tanpa pengemudi.

Sebagian besar kemajuan pada "AI generatif" telah terjadi sejak tahun 2017, ketika delapan peneliti dari Google menulis makalah berjudul "Attention is All You Need".

Makalah itu menjelaskan arsitektur untuk menghasilkan teks di mana "model bahasa besar" (LLM) diberi satu set "token" (kata dan tanda baca) dan berfokus untuk memprediksi "token" berikutnya.

Langkah maju besar berikutnya terjadi pada November 2022. Antarmuka obrolan bernama ChatGPT, yang diproduksi oleh startup yang didanai dengan baik bernama OpenAI, menjadi viral dalam semalam.

Saat ini, ada beberapa penyedia LLM yang berbeda, yang menyediakan antarmuka obrolan konsumen dan API pengembang:

- **OpenAI.** Didirikan pada tahun 2015 oleh delapan orang termasuk peneliti AI Ilya Sutskever, insinyur perangkat lunak Greg Brockman, Sam Altman (kepala YC), dan Elon Musk.
- **Anthropic (Claude).** Didirikan pada tahun 2020 oleh Dario Amodei dan sekelompok mantan peneliti OpenAI. Menghasilkan model yang populer untuk penulisan kode, serta tugas berbasis API.
- **Google (Gemini).** LLM intinya diproduksi oleh tim DeepMind yang diakuisisi oleh Google pada tahun 2014.
- **Meta (Llama).** Perusahaan induk Facebook menghasilkan kelas model sumber terbuka Llama. Dianggap sebagai grup AI sumber terbuka terkemuka di AS.
- **Lainnya** termasuk Mistral (perusahaan Prancis sumber terbuka), DeepSeek (perusahaan Tiongkok sumber terbuka).

### Memilih Penyedia dan Model

Salah satu pilihan pertama yang perlu Anda buat dalam membangun aplikasi AI adalah model mana yang akan dijadikan dasar. Berikut adalah beberapa pertimbangan:

#### Dihosting vs sumber terbuka (Hosted vs open-source)

Saran pertama yang biasanya kami berikan kepada orang-orang saat membangun aplikasi AI adalah memulai dengan penyedia yang dihosting seperti OpenAI, Anthropic, atau Google Gemini.

Bahkan jika Anda berpikir Anda perlu menggunakan sumber terbuka, buat prototipe dengan API cloud, atau Anda akan men-debug masalah infrastruktur alih-alih benar-benar berulang pada kode Anda. Salah satu cara untuk melakukan ini tanpa menulis ulang banyak kode adalah dengan menggunakan pustaka perutean model (lebih lanjut tentang itu nanti).

#### Ukuran model: akurasi vs biaya/latensi

Model bahasa besar bekerja dengan mengalikan larik dan matriks angka. Setiap penyedia memiliki model yang lebih besar, yang lebih mahal, akurat, dan lebih lambat, dan model yang lebih kecil, yang lebih cepat, lebih murah, dan kurang akurat.

Kami biasanya merekomendasikan agar orang-orang memulai dengan model yang lebih mahal saat membuat prototipe — sekali Anda mendapatkan sesuatu yang berfungsi, Anda dapat menyesuaikan biaya.

#### Ukuran jendela konteks (Context window size)

Satu variabel yang mungkin ingin Anda pertimbangkan adalah "jendela konteks" model Anda. Berapa banyak token yang bisa diambilnya? Kadang-kadang, terutama untuk pembuatan prototipe awal, Anda mungkin ingin memasukkan konteks dalam jumlah besar ke dalam model untuk menghemat upaya dalam memilih konteks yang relevan.

Saat ini, jendela konteks terpanjang dimiliki oleh rangkaian model Gemini Flash Google; Gemini Flash 1.5 Pro mendukung jendela konteks 2 juta token (kira-kira 4.000 halaman teks).

Ini memungkinkan beberapa aplikasi yang menarik; Anda mungkin membayangkan asisten dukungan dengan seluruh basis kode dalam jendela konteksnya.

#### Model penalaran (Reasoning models)

Jenis model lain adalah apa yang disebut "model penalaran", yaitu, model yang melakukan banyak logika secara internal sebelum mengembalikan respons. Mungkin butuh waktu detik, atau menit, untuk memberikan respons, dan itu akan mengembalikan respons sekaligus (sambil mengalirkan beberapa "langkah berpikir" di sepanjang jalan).

Model penalaran menjadi jauh lebih baik dan melakukannya dengan cepat. Sekarang, mereka mampu memecah masalah yang rumit dan benar-benar "memikirkannya" langkah demi langkah, hampir seperti yang dilakukan manusia.

Apa yang berubah? Teknik baru seperti _chain-of-thought prompting_ memungkinkan model-model ini menunjukkan pekerjaan mereka, langkah demi langkah. Lebih baik lagi, metode yang lebih baru seperti "chain of draft" dan "chain of preference optimization" membantu mereka tetap fokus. Daripada bertele-tele—menulis setiap detail kecil atau mengulang diri mereka sendiri—mereka langsung ke intinya, hanya membagikan langkah-langkah yang paling penting dan melewati basa-basi. Ini berarti Anda mendapatkan penalaran yang jelas dan efisien, bukan dinding teks.

Intinya: jika Anda memberi model-model ini konteks yang cukup dan contoh yang baik, mereka dapat memberikan jawaban yang mengejutkan dan berkualitas tinggi untuk pertanyaan-pertanyaan sulit. Misalnya, jika Anda ingin model membantu mendiagnosis kasus medis yang rumit, memberinya riwayat pasien, gejala, dan beberapa contoh kasus akan menghasilkan hasil yang jauh lebih baik daripada hanya mengajukan pertanyaan yang tidak jelas. Triknya masih sama: semakin Anda membantu mereka di awal, semakin baik penalaran mereka.

Anda harus menganggap model penalaran sebagai "generator laporan" — Anda perlu memberi mereka banyak konteks di awal melalui _many-shot prompting_ (lebih lanjut tentang itu nanti). Jika Anda melakukan itu, mereka dapat mengembalikan respons berkualitas tinggi. Jika tidak, mereka akan menyimpang.

#### Penyedia dan model (Mei 2025)

![image15](images/image15.png)

### Menulis Prompt yang Hebat

Salah satu keterampilan mendasar dalam rekayasa AI adalah menulis prompt yang baik.

LLM akan mengikuti instruksi, jika Anda tahu cara menentukannya dengan baik. Berikut adalah beberapa tips dan teknik yang akan membantu:

#### Beri LLM lebih banyak contoh

Ada tiga teknik dasar untuk prompt.

- **Zero-shot**: Pendekatan "YOLO". Ajukan pertanyaan dan harapkan yang terbaik.
- **Single-shot**: Ajukan pertanyaan, lalu berikan satu contoh (dengan input + output) untuk memandu model
- **Few-shot**: Berikan beberapa contoh untuk kontrol yang lebih tepat atas keluaran.

Lebih banyak contoh = lebih banyak panduan, tetapi juga membutuhkan lebih banyak waktu.

#### Pendekatan "kristal benih" (A "seed crystal" approach)

Jika Anda tidak yakin harus mulai dari mana, Anda dapat meminta model untuk menghasilkan prompt untuk Anda. Misalnya, "Hasilkan prompt untuk meminta gambar anjing yang bermain dengan paus." Ini memberi Anda v1 yang solid untuk disempurnakan. Anda juga dapat meminta model untuk menyarankan apa yang dapat membuat prompt itu lebih baik.

Biasanya Anda harus meminta model yang sama dengan yang akan Anda berikan prompt: Claude paling baik dalam menghasilkan prompt untuk Claude, gpt-4o untuk gpt-4o, dll.

Kami benar-benar membangun CMS prompt ke dalam lingkungan pengembangan lokal Mastra karena alasan ini.

#### Gunakan prompt sistem (system prompt)

Saat mengakses model melalui API, biasanya mereka memiliki kemampuan untuk mengatur prompt sistem, misalnya, memberikan karakteristik model yang Anda ingin dimilikinya. Ini akan menjadi tambahan dari "prompt pengguna" spesifik yang diteruskan.

Contoh yang menyenangkan adalah meminta model untuk menjawab pertanyaan yang sama sebagai persona yang berbeda, misalnya sebagai Steve Jobs vs sebagai Bill Gates, atau sebagai Harry Potter vs sebagai Draco Malfoy.

Ini bagus untuk membantu Anda membentuk nada di mana agen atau asisten merespons, tetapi biasanya tidak meningkatkan akurasi.

#### Trik pemformatan aneh

Model AI dapat sensitif terhadap pemformatan—gunakan untuk keuntungan Anda:

- KAPITALISASI dapat menambah bobot pada kata-kata tertentu.
- Struktur seperti XML dapat membantu model mengikuti instruksi dengan lebih tepat.
- Claude & GPT-4 merespons lebih baik terhadap prompt terstruktur (misalnya, tugas, konteks, batasan).

Bereksperimen dan sesuaikan—perubahan kecil dalam struktur dapat membuat perbedaan besar! Anda dapat mengukurnya dengan evals (lebih lanjut tentang itu nanti).

#### Contoh: prompt yang hebat

Jika Anda berpikir prompt Anda sudah rinci, coba baca beberapa prompt produksi. Mereka cenderung sangat rinci. Berikut adalah contoh (sekitar sepertiga dari) prompt pembuatan kode produksi langsung (digunakan dalam alat yang disebut bolt.new.)

```

Anda adalah Bolt, asisten AI ahli dan pengembang perangkat lunak senior yang luar biasa dengan pengetahuan luas di berbagai bahasa pemrograman, kerangka kerja, dan praktik terbaik.

<system_constraints> Anda beroperasi di lingkungan yang disebut WebContainer, runtime Node.js dalam browser yang meniru sistem Linux sampai batas tertentu. Namun, ia berjalan di browser dan tidak menjalankan sistem Linux berfitur lengkap dan tidak bergantung pada VM cloud untuk menjalankan kode. Semua kode dijalankan di browser. Ia memang dilengkapi dengan shell yang meniru zsh. Kontainer tidak dapat menjalankan binari asli karena tidak dapat dieksekusi di browser. Itu berarti ia hanya dapat menjalankan kode yang asli untuk browser termasuk JS, WebAssembly, dll.

Shell dilengkapi dengan binari 'python' dan 'python3', tetapi DIBATASI HANYA PADA PYTHON STANDARD LIBRARY SAJA Ini berarti:

  - TIDAK ADA dukungan `pip`! Jika Anda mencoba menggunakan `pip`, Anda harus secara eksplisit menyatakan bahwa itu tidak tersedia.
  - KRITIS: Pustaka pihak ketiga tidak dapat diinstal atau diimpor.
  - Bahkan beberapa modul pustaka standar yang membutuhkan dependensi sistem tambahan (seperti `curses`) tidak tersedia.
  - Hanya modul dari pustaka standar Python inti yang dapat digunakan.
    Selain itu, tidak ada `g++` atau kompilator C/C++ yang tersedia. WebContainer TIDAK DAPAT menjalankan binari asli atau mengkompilasi kode C/C++!

Ingatlah batasan-batasan ini saat menyarankan solusi Python atau C++ dan sebutkan batasan-batasan ini secara eksplisit jika relevan dengan tugas yang sedang dikerjakan.

WebContainer memiliki kemampuan untuk menjalankan server web tetapi membutuhkan penggunaan paket npm (misalnya, Vite, servor, serve, http-server) atau menggunakan API Node.js untuk mengimplementasikan server web.

\ \ \ ...

```

---

## BAGIAN II: MEMBANGUN AGEN

### Agen 101

Anda dapat menggunakan panggilan LLM langsung untuk transformasi sekali-pakai: "diberi transkrip video, tulis draf deskripsi."

Untuk interaksi yang kompleks dan berkelanjutan, Anda biasanya perlu membangun agen di atasnya. Pikirkan agen sebagai karyawan AI daripada kontraktor: mereka mempertahankan konteks, memiliki peran tertentu, dan dapat menggunakan alat untuk menyelesaikan tugas.

#### Tingkat Otonomi

Ada banyak definisi agen dan agensi yang beredar. Kami lebih suka menganggap agensi sebagai sebuah spektrum. Seperti mobil tanpa pengemudi, ada berbagai tingkat otonomi agen.

- Pada tingkat rendah, agen membuat pilihan biner dalam pohon keputusan
- Pada tingkat menengah, agen memiliki memori, memanggil alat, dan mencoba kembali tugas yang gagal
- Pada tingkat tinggi, agen melakukan perencanaan, membagi tugas menjadi sub-tugas, dan mengelola antrian tugas mereka.

Buku ini sebagian besar berfokus pada agen pada tingkat otonomi rendah hingga menengah. Saat ini, hanya ada beberapa contoh agen otonomi tinggi yang digunakan secara luas.

##### Contoh Kode

Di Mastra, agen memiliki memori yang persisten, konfigurasi model yang konsisten, dan dapat mengakses serangkaian alat dan alur kerja.

Berikut cara membuat agen dasar:

```typescript
import { Agent } from "@mastra/core/agent"
import { openai } from
`@ai-sdk/openai"

export const myAgent = new Agent({
  name: "My Agent",
  instructions: "You are a helpful assistant.",
  model: openai("gpt-4o-mini"),
})
```

### Perutean Model dan Keluaran Terstruktur

Berguna untuk dapat dengan cepat menguji dan bereksperimen dengan model yang berbeda tanpa perlu mempelajari beberapa SDK penyedia. Ini dikenal sebagai _perutean model (model routing)_.

Berikut adalah contoh JavaScript dengan pustaka AI SDK:

```typescript
import { openai } from "@ai-sdk/openai"
import { Agent } from "@mastra/core/agent"

// Contoh 1: Mendefinisikan dan mengekspor Agen (dari image40.png)
export const myAgent = new Agent({
  name: "My Agent",
  instructions: "You are a helpful assistant.",
  model: openai("gpt-4o-mini"),
})

// Gunakan agen (hapus komentar untuk dieksekusi)
const result = await weatherAgent.generate("What is the weather like?")
```

#### Keluaran terstruktur

Saat Anda menggunakan LLM sebagai bagian dari aplikasi, Anda sering ingin mereka mengembalikan data dalam format JSON alih-alih teks yang tidak terstruktur. Sebagian besar model mendukung "keluaran terstruktur" untuk memungkinkan hal ini.

Berikut adalah contoh meminta respons terstruktur dengan menyediakan skema:

```typescript
import { z } from "zod"

const mySchema = z.object({
  definition: z.string(),
  examples: z.array(z.string()),
})

const response = await llm.generate("Define machine learning and give examples.", {
  output: mySchema,
})

console.log(response.object)
```

LLM sangat kuat untuk memproses teks yang tidak terstruktur atau semi-terstruktur. Pertimbangkan untuk memasukkan teks resume dan mengekstrak daftar pekerjaan, perusahaan, dan rentang tanggal, atau memasukkan catatan medis dan mengekstrak daftar gejala.

### Pemanggilan Alat (Tool Calling)

Alat adalah fungsi yang dapat dipanggil agen untuk melakukan tugas-tugas tertentu — apakah itu mengambil data cuaca, mengkueri database, atau memproses perhitungan.

Kunci penggunaan alat yang efektif adalah komunikasi yang jelas dengan model tentang apa yang dilakukan setiap alat dan kapan harus menggunakannya.

Berikut adalah contoh pembuatan dan penggunaan alat:

```javascript
import { createTool } from "@mastra/core/tools"
import { z } from "zod"

const getWeatherInfo = async (city: string) => {
  // Ganti dengan panggilan API yang sebenarnya ke layanan
  // cuaca
  console.log(`Fetching weather for ${city}...`)
  // Contoh struktur data
  return { temperature: 20, conditions: "Sunny" }
}

export const weatherTool = createTool({
  id: "Get Weather Information",
  description: "Fetches the current weatherninformation for a given city",
  inputSchema: z.object({
    city: z.string().describe("City name"),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    conditions: z.string(),
  }),
  execute: async ({ context: { city } }) => {
    console.log("Using tool to fetch weatherninformation for", city)
    return await getWeatherInfo(city)
  },
})
```

#### Praktik terbaik:

- Berikan deskripsi rinci dalam definisi alat dan prompt sistem
- Gunakan skema input/output tertentu
- Gunakan penamaan semantik yang sesuai dengan fungsi alat (misalnya `multiplyNumbers` alih-alih `doStuff`)

Ingat: Semakin jelas Anda mengomunikasikan tujuan dan penggunaan alat kepada model, semakin besar kemungkinan model menggunakannya dengan benar. Anda harus menjelaskan apa yang dilakukan dan kapan harus memanggilnya.

#### Merancang alat Anda: langkah paling penting

KETIKA ANDA MEMBUAT aplikasi AI, hal terpenting yang harus Anda lakukan adalah memikirkan desain alat Anda dengan cermat.

- Apa daftar semua alat yang Anda perlukan?
- Apa yang akan dilakukan masing-masing alat tersebut?

Tuliskan ini dengan jelas sebelum Anda mulai membuat kode.

#### Contoh dunia nyata: agen rekomendasi buku Alana

Alana Goyal, seorang investor Mastra, ingin membangun agen yang dapat memberikan rekomendasi dan analisis cerdas tentang korpus rekomendasi buku investor.

##### Percobaan pertama:

Dia mencoba memasukkan semua buku ke jendela pengetahuan agen. Ini tidak berhasil dengan baik — agen tidak dapat bernalar tentang data secara terstruktur.

##### Pendekatan yang lebih baik:

Dia memecah masalah menjadi serangkaian alat tertentu, masing-masing menangani aspek data yang berbeda:

- Alat untuk mengakses korpus investor
- Alat untuk rekomendasi buku
- Alat untuk buku yang ditandai berdasarkan genre

Kemudian, dia menambahkan lebih banyak alat untuk operasi umum:

- Dapatkan semua buku berdasarkan genre
- Dapatkan rekomendasi buku berdasarkan investor
- Urutkan orang yang menulis rekomendasi berdasarkan jenis (pendiri, investor, dll.)

Jika seorang analis manusia melakukan proyek ini, mereka akan mengikuti serangkaian operasi atau kueri tertentu.

Triknya adalah mengambil operasi tersebut dan menuliskannya sebagai alat atau kueri yang dapat digunakan agen Anda.

##### Hasil:

Dengan alat-alat ini, agen sekarang dapat menganalisis korpus buku dengan cerdas, menjawab pertanyaan yang berbeda, dan memberikan rekomendasi yang berguna — sama seperti analis manusia yang terampil.

• • •

Berpikirlah seperti seorang analis. Pecah masalah Anda menjadi operasi yang jelas dan dapat digunakan kembali. Tulis masing-masing sebagai alat.

Jika Anda melakukan ini, agen Anda akan jauh lebih mumpuni, andal, dan berguna.

### Memori Agen

Memori sangat penting untuk membuat agen yang mempertahankan percakapan yang bermakna dan kontekstual dari waktu ke waktu. Meskipun LLM dapat memproses pesan individual secara efektif, mereka membutuhkan bantuan dalam mengelola konteks jangka panjang dan interaksi historis.

#### Memori kerja (Working memory)

Memori kerja menyimpan karakteristik pengguna yang relevan, persisten, dan jangka panjang. Contoh populer tentang cara melihat memori kerja adalah dengan bertanya kepada ChatGPT apa yang diketahuinya tentang Anda.

(Bagi saya, karena anak-anak saya sering berbicara dengannya di perangkat saya, ia akan memberi tahu saya bahwa saya adalah seorang gadis berusia lima tahun yang menyukai squishmellows.)

#### Memori hierarkis (Hierarchical memory)

Memori hierarkis adalah cara mewah untuk mengatakan menggunakan pesan terbaru bersama dengan memori jangka panjang yang relevan.

Misalnya, katakanlah kita sedang bercakap-cakap. Beberapa menit kemudian, Anda bertanya kepada saya apa yang saya lakukan akhir pekan lalu.

Ketika Anda bertanya, saya mencari di memori saya untuk peristiwa yang relevan (yaitu, dari akhir pekan lalu). Kemudian saya memikirkan beberapa pesan terakhir yang telah kita tukar. Kemudian, saya menggabungkan kedua hal itu bersama-sama di "jendela konteks" _saya_ dan saya merumuskan respons kepada Anda.

Secara garis besar, seperti itulah tampilan sistem memori agen yang baik juga. Mari kita ambil kasus sederhana, dan katakan kita memiliki larik pesan, pengguna mengirimkan kueri, dan kita ingin memutuskan apa yang akan dimasukkan.

Berikut cara kita melakukannya di Mastra:

```javascript
// Contoh: Pengguna bertanya tentang diskusi fitur sebelumnya
await agent.stream("What did we decide about the search feature last week?", {
  memoryOptions: {
    lastMessages: 10,
    semanticRecall: {
      topK: 3,
      messageRange: 2,
    },
  },
})
```

Pengaturan `lastMessages` mempertahankan jendela geser dari pesan terbaru. Ini memastikan agen Anda selalu memiliki akses ke konteks percakapan langsung:

`semanticRecall` menunjukkan bahwa kita akan menggunakan RAG (lebih lanjut nanti) untuk mencari melalui percakapan masa lalu.

`topK` adalah jumlah pesan yang akan diambil.

`messageRange` adalah rentang di setiap sisi kecocokan untuk disertakan.

Alih-alih membanjiri model dengan seluruh riwayat percakapan, ia secara selektif menyertakan interaksi masa lalu yang paling relevan.

Dengan bersikap selektif tentang konteks mana yang akan dimasukkan, kami mencegah luapan jendela konteks sambil tetap mempertahankan informasi yang paling relevan untuk interaksi saat ini.

#### Pemroses memori (Memory processors)

KADANG-KADANG MENINGKATKAN jendela konteks Anda bukanlah solusi yang tepat. Ini berlawanan dengan intuisi tetapi terkadang Anda ingin memangkas jendela konteks Anda secara sengaja atau hanya mengontrolnya.

Pemroses Memori (Memory Processors) memungkinkan Anda untuk memodifikasi daftar pesan yang diambil dari memori _sebelum_ mereka ditambahkan ke jendela konteks agen dan dikirim ke LLM. Ini berguna untuk mengelola ukuran konteks, memfilter konten, dan mengoptimalkan kinerja.

Mastra menyediakan pemroses bawaan.

##### `TokenLimiter`

Pemroses ini digunakan untuk mencegah kesalahan yang disebabkan oleh melebihi batas jendela konteks LLM. Ia menghitung token dalam pesan memori yang diambil dan menghapus pesan tertua hingga jumlah total di bawah batas yang ditentukan.

```javascript
import { Memory } from "@mastra/memory"
import { TokenLimiter } from "@mastra/memory/processors"
import { Agent } from "@mastra/core/agent"
import { openai } from "@ai-sdk/openai"

const agent = new Agent({
  model: openai("gpt-4o"),
  memory: new Memory({
    processors: [
      // Pastikan total token dari memori tidak
      // melebihi ~127k
      new TokenLimiter(127000),
    ],
  }),
})
```

##### `ToolCallFilter`

Pemroses ini menghapus panggilan alat dari pesan memori yang dikirim ke LLM. Ini menghemat token dengan mengecualikan interaksi alat yang berpotensi panjang dari konteks, yang berguna jika detailnya tidak diperlukan untuk interaksi di masa mendatang. Ini juga berguna jika Anda selalu ingin agen Anda memanggil alat tertentu lagi dan tidak bergantung pada hasil alat sebelumnya dalam memori.

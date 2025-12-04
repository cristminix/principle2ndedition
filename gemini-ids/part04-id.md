# BAGIAN V

PEMBANGKITAN YANG DITINGKATKAN RETRIEVAL (RAG)

## RAG 101

RAG memungkinkan agen untuk mencerna data pengguna dan menyintesisnya dengan basis pengetahuan global mereka untuk memberikan respons berkualitas tinggi kepada pengguna.

Berikut cara kerjanya.

- **Pemotongan (_Chunking_):** Anda mulai dengan mengambil dokumen (meskipun kita juga dapat menggunakan jenis sumber lain) dan memotongnya. Kita ingin membagi dokumen menjadi potongan-potongan seukuran gigitan untuk pencarian.
- **Penyematan (_Embedding_):** Setelah pemotongan, Anda akan ingin menyematkan data Anda – mengubahnya menjadi **vektor**, atau larik 1536 nilai antara 0 dan 1, yang mewakili makna teks.

Kami melakukan ini dengan LLM, karena mereka membuat penyematan jauh lebih akurat; OpenAI memiliki API untuk ini, ada penyedia lain seperti Voyage atau Cohere.

Anda perlu menggunakan **DB vektor** yang dapat menyimpan

vektor-vektor ini dan melakukan perhitungan untuk mencari di dalamnya. Anda dapat menggunakan **pgvector**, yang sudah tersedia dengan Postgres.

- **Pengindeksan (_Indexing_):** Setelah Anda memilih DB vektor, Anda perlu menyiapkan indeks untuk menyimpan potongan dokumen Anda, yang diwakili sebagai penyematan vektor.
- **Pengkuerian (_Querying_):** Oke, setelah penyiapan itu, Anda sekarang dapat mengkueri database!

Di balik layar, Anda akan menjalankan algoritma yang membandingkan string kueri Anda dengan semua potongan di database dan mengembalikan yang paling mirip. Algoritma yang paling populer disebut "**kemiripan kosinus**" (_cosine similarity_).

Implementasinya mirip dengan kueri geospasial yang mencari lintang/bujur, kecuali pencarian berjalan di atas 1536 dimensi alih-alih dua.

Anda juga dapat menggunakan algoritma lain.

- **Penyusunan Ulang Peringkat (_Reranking_):** Secara opsional, setelah mengkueri, Anda dapat menggunakan _reranker_. Penyusunan ulang peringkat adalah cara pencarian kumpulan data yang lebih mahal secara komputasi. Anda dapat menjalankannya di atas hasil Anda untuk meningkatkan urutan (tetapi akan terlalu lama untuk menjalankannya di atas seluruh database).
- **Sintesis (_Synthesis_):** Akhirnya, Anda meneruskan hasil Anda sebagai konteks ke LLM, bersama dengan konteks lain yang Anda inginkan, dan itu dapat menyintesis jawaban untuk pengguna.

## MEMILIH DATABASE VEKTOR

Salah satu pertanyaan terbesar yang dimiliki orang-orang di sekitar RAG adalah bagaimana mereka harus memikirkan DB vektor.

Ada beberapa faktor bentuk basis data vektor:

1.  Fitur di atas basis data sumber terbuka (**pgvector** di atas Postgres, _vector store_ libsql)
2.  Sumber terbuka mandiri (**Chroma**)
3.  Layanan _cloud_ yang dihosting mandiri (**Pinecone**).
4.  Dihosting oleh penyedia _cloud_ yang ada (**Cloudflare Vectorize**, **DataStax Astra**).

Pandangan kami adalah bahwa kecuali kasus penggunaan Anda **sangat khusus**, rangkaian fitur DB vektor sebagian besar telah menjadi **komoditas**.

Kembali pada tahun 2023, pendanaan VC mendorong ledakan besar dalam perusahaan DB vektor, yang meskipun menarik untuk ruang secara keseluruhan, menciptakan serangkaian solusi yang bersaing dengan sedikit diferensiasi.

Saat ini, dalam praktiknya, tim melaporkan bahwa hal yang paling penting adalah mencegah **penyebaran infra** (_infra sprawl_) (layanan lain yang harus dipertahankan). Rekomendasi kami:

Jika Anda sudah menggunakan Postgres untuk _backend_ aplikasi Anda, **pgvector** adalah pilihan yang bagus. Jika Anda memulai proyek baru,

**Pinecone** adalah pilihan _default_ dengan UI yang bagus.

Jika penyedia _cloud_ Anda memiliki layanan DB vektor terkelola, gunakan itu.

## MENYIAPKAN PIPELINE RAG ANDA

### Pemotongan (_Chunking_)

Pemotongan adalah proses memecah dokumen besar menjadi potongan-potongan yang lebih kecil dan mudah dikelola untuk diproses.

Hal utama yang perlu Anda pilih di sini adalah **strategi** dan **jendela tumpang tindih** (_overlap window_). Pemotongan yang baik menyeimbangkan **pelestarian konteks** dengan **granularitas retrieval**.

Strategi pemotongan termasuk pemisahan **rekursif**, berbasis **karakter**, **sadar-token**, dan **spesifik-format** (Markdown, HTML, JSON, LaTeX). Mastra mendukung semuanya.

### Penyematan (_Embedding_)

Penyematan adalah representasi numerik dari teks yang menangkap makna semantik. Vektor-vektor ini memungkinkan kita untuk melakukan pencarian kemiripan. Mastra mendukung beberapa penyedia penyematan seperti OpenAI dan Cohere, dengan kemampuan untuk menghasilkan penyematan untuk potongan individu dan larik teks.

### Upsert

Operasi **Upsert** memungkinkan Anda untuk memasukkan atau memperbarui vektor dan metadata terkait di _vector store_ Anda. Operasi ini penting untuk mempertahankan basis pengetahuan Anda, menggabungkan vektor penyematan dan metadata tambahan apa pun yang mungkin berguna untuk _retrieval_.

### Pengindeksan (_Indexing_)

**Indeks** adalah struktur data yang mengoptimalkan pencarian kemiripan vektor. Saat membuat indeks, Anda menentukan parameter seperti **ukuran dimensi** (yang cocok dengan model penyematan Anda) dan **metrik kemiripan** (_similarity metric_) (kosinus, euclidean, _dot product_). Ini adalah langkah penyiapan sekali pakai untuk setiap koleksi vektor.

## Pengkuerian (_Querying_)

Pengkuerian melibatkan pengubahan input pengguna menjadi penyematan dan menemukan vektor serupa di _vector store_ Anda. Kueri dasar mengembalikan potongan yang paling mirip secara semantik dengan input Anda, biasanya dengan skor kemiripan. Di balik layar, ini adalah sekumpulan perkalian matriks untuk menemukan titik terdekat dalam ruang _n_-dimensi (pikirkan tentang pencarian geo dengan lat/lng, kecuali dalam 1536 dimensi).

Algoritma yang paling umum yang melakukan ini disebut **kemiripan kosinus** (_cosine similarity_) (meskipun Anda dapat menggunakan yang lain).

**Kueri Hibrida dengan Metadata (_Hybrid Queries with Metadata_).** Kueri hibrida menggabungkan pencarian kemiripan vektor dengan pemfilteran metadata tradisional. Ini memungkinkan Anda untuk mempersempit hasil berdasarkan **kemiripan semantik** dan bidang metadata terstruktur seperti tanggal, kategori, atau atribut khusus.

## Penyusunan Ulang Peringkat (_Reranking_)

Penyusunan ulang peringkat adalah langkah **pasca-pemrosesan** yang meningkatkan relevansi hasil dengan menerapkan metode penilaian yang lebih canggih. Ini mempertimbangkan faktor-faktor seperti **relevansi semantik**, **kemiripan vektor**, dan **bias posisi** untuk menyusun ulang hasil demi akurasi yang lebih baik.

Ini adalah proses yang lebih intensif secara komputasi, jadi Anda biasanya tidak ingin menjalankannya di atas seluruh korpus Anda karena alasan latensi — Anda biasanya hanya akan menjalankannya pada contoh kode.

## Contoh Kode

Berikut adalah beberapa kode menggunakan Mastra untuk menyiapkan _pipeline_ RAG. Mastra mencakup antarmuka yang konsisten untuk membuat indeks, melakukan _upsert_ penyematan, dan mengkueri, sambil menawarkan fitur dan optimasi unik mereka sendiri, jadi meskipun contoh ini menggunakan Pinecone, Anda dapat dengan mudah menggunakan DB lain.

```typescript
import { Mastra } from "@mastra/core";
import { MDocument, PgVector } from "@mastra/rag";
import { embedMany, embed } from "@ai";
import { openai } from "@oai-sdk/openai";

// Inisialisasi dokumen dan buat potongan
const doc = MDocument.fromText('Your text content here...');
const chunks = await doc.chunk({
 strategy: "recursive",
 size: 512,
 overlap: 50,
});

// Hasilkan penyematan
const { embeddings } = await embedMany({
 values: chunks.map(chunk => chunk.text),
 model: openai.embedding("text-embedding-3-small"),
});

// Inisialisasi vector store dan Mastra
const pgVector = new PgVector({ process.env.POSTGRES_CONNECTION_STRING! });
const mastra = new Mastra({ vectors: { pgVector } });

// Simpan penyematan
await pgVector.createIndex("embeddings", 1536);
await pgVector.upsert({
 "embeddings",
 embeddings,
 chunks.map(chunk => ({ text: chunk.text }))
});

// Contoh kueri
const query = "insert query here";
const { embedding } = await embed({
 value: query,
 model: openai.embedding("text-embedding-3-small"),
});

// Ambil potongan serupa
const results = await pgVector.query("embeddings", embedding);
const relevantContext = results
 .map(result => result?.metadata?.text)
 .join('nn');

// Hasilkan respons
const completion = await openai("gpt-4o-mini").generate({
 Please answer the following question:
 ${query}

 Based on this context: ${relevantContext}
 If the context lacks sufficient information, please state that
 explicitly.
});

console.log(completion.text);
```

### Catatan: Ada cara lanjutan untuk melakukan RAG: menggunakan LLM untuk menghasilkan metadata, menggunakan LLM untuk menyaring kueri pencarian; menggunakan

basis data grafik (_graph databases_) untuk memodelkan hubungan yang kompleks. Ini mungkin berguna bagi Anda, tetapi mulailah dengan menyiapkan _pipeline_ yang berfungsi dan menyesuaikan parameter normal — model penyematan, _reranker_, algoritma pemotongan — terlebih dahulu.

# BAGIAN VI

SISTEM MULTI-AGEN

## SISTEM MULTI-AGEN 101

Pikirkan **sistem multi-agen** seperti tim khusus, seperti pemasaran atau rekayasa, di sebuah perusahaan. Agen AI yang berbeda

bekerja sama, masing-masing dengan peran khusus mereka sendiri, untuk pada akhirnya menyelesaikan tugas yang lebih kompleks.

Menariknya, jika Anda pernah menggunakan alat pembuatan kode seperti agen Replit yang di-_deploy_ dalam produksi, Anda sebenarnya sudah menggunakan sistem multi-agen.

Satu agen bekerja dengan Anda untuk merencanakan / merancang kode Anda. Setelah Anda bekerja dengan agen untuk merencanakannya, Anda bekerja dengan agen "**manajer kode**" yang meneruskan instruksi ke penulis kode, kemudian mengesekusi kode yang dihasilkan dalam _sandbox_ dan meneruskan kesalahan apa pun kembali ke penulis kode.

Masing-masing agen ini memiliki memori yang berbeda,

_system prompt_ yang berbeda, dan akses ke alat yang berbeda.

Kami sering bercanda bahwa merancang sistem multi-agen melibatkan banyak keterampilan yang digunakan dalam **desain organisasi**. Anda mencoba mengelompokkan tugas terkait ke dalam deskripsi pekerjaan di mana Anda mungkin dapat merekrut seseorang. Anda mungkin memberikan tugas kreatif atau generatif kepada satu orang dan tugas ulasan atau analitis kepada orang lain. Anda ingin berpikir tentang **dinamika jaringan**. Apakah lebih baik bagi tiga agen khusus untuk **bergosip** di antara mereka sendiri sampai konsensus tercapai? Atau memberikan output mereka kembali ke agen manajer yang dapat membuat

keputusan?

![image](images/image4.png)

Salah satu keuntungan dari sistem multi-agen adalah

**memecah tugas yang kompleks menjadi bagian-bagian yang mudah dikelola**. Dan tentu saja, desain adalah fraktal. Hierarki hanyalah supervisor dari supervisor. Tetapi mulailah dengan versi yang paling sederhana terlebih dahulu.

Mari kita pecah beberapa pola.

### SUPERVISOR AGEN

**Supervisor agen** adalah agen khusus yang mengkoordinasikan dan mengelola agen lain. Cara yang paling mudah untuk melakukan ini adalah dengan meneruskan agen lain yang dibungkus sebagai alat.

Misalnya, dalam sistem pembuatan konten, agen penerbit (_publisher agent_) mungkin mengawasi penulis naskah (_copywriter_) dan editor:

```javascript
const publisherAgent = new Agent({
  name: "publisherAgent",
  instructions: "You are a publisher agent that coordinates content creation. First call the copywriter for initial content, then the editor for refinement.",
  model: {
    provider: "ANTHROPIC",
    name: "claude-3-5-sonnet-20241022",
  },
  tools: { copywriterTool, editorTool },
})
```

# ALIRAN KONTROL (_CONTROL FLOW_)

Saat membangun aplikasi AI yang kompleks, Anda memerlukan cara terstruktur untuk mengelola bagaimana agen berpikir dan mengerjakan tugas. Sama seperti manajer proyek tidak akan mulai membuat kode tanpa rencana, agen harus menetapkan pendekatan sebelum terjun ke eksekusi.

Sama seperti bagaimana praktik umum bagi PM untuk membuat spesifikasi fitur, mendapatkan persetujuan _stakeholder_, dan baru kemudian menugaskan pekerjaan rekayasa, Anda tidak boleh berharap untuk bekerja dengan agen tanpa terlebih dahulu menyelaraskan pada pekerjaan yang diinginkan.

Kami merekomendasikan untuk terlibat dengan agen Anda pada detail arsitektur terlebih dahulu — dan mungkin menambahkan beberapa _checkpoint_ untuk umpan balik manusia dalam alur kerja mereka.

# ALUR KERJA SEBAGAI ALAT

Semoga, sekarang, Anda mulai melihat bahwa semua arsitektur multi-agen bermuara pada primitif mana yang Anda gunakan dan bagaimana Anda mengaturnya.

Sangat penting untuk mengingat pembingkaian ini ketika mencoba membangun tugas yang lebih kompleks ke dalam agen.

Misalnya Anda ingin agen Anda menyelesaikan 3 tugas terpisah. Anda tidak dapat melakukan ini dengan mudah dalam satu panggilan LLM. Tetapi Anda dapat mengubah masing-masing tugas tersebut menjadi **alur kerja individual**. Ada lebih banyak kepastian dalam melakukannya dengan cara ini karena Anda dapat menetapkan urutan langkah alur kerja dan memberikan lebih banyak struktur.

Setiap alur kerja ini kemudian dapat diteruskan sebagai alat ke agen.

## MENGGABUNGKAN POLA

Jika Anda pernah bermain-main dengan alat penulisan kode seperti Repl.it dan Lovable.dev, Anda akan melihat bahwa mereka memiliki agen perencanaan dan agen penulisan kode. (Dan pada kenyataannya agen penulisan kode adalah dua agen yang berbeda, **pengulas** dan **penulis** yang bekerja sama.)

Sangat penting bagi alat-alat ini untuk memiliki agen perencanaan jika mereka ingin membuat kiriman yang baik untuk Anda sama sekali.

Agen perencanaan mengusulkan arsitektur untuk aplikasi yang Anda inginkan. Ia bertanya kepada Anda, "**bagaimana kedengarannya?**"

Anda dapat memberinya umpan balik sampai Anda dan agen cukup selaras pada rencana sehingga dapat meneruskannya ke agen penulisan kode.

Dalam contoh ini, agen mewujudkan langkah-langkah yang berbeda dalam

alur kerja. Mereka bertanggung jawab baik untuk perencanaan, pengkodean, atau peninjauan dan masing-masing bekerja dalam urutan tertentu.

Dalam contoh sebelumnya, Anda akan melihat bahwa alur kerja adalah langkah-langkah (alat) untuk agen. Ini adalah contoh terbalik satu sama lain, yang membawa kita, sekali lagi, pada kesimpulan penting.

Semua primitif dapat **diatur ulang** dengan cara yang Anda inginkan, khusus untuk aliran kontrol yang Anda inginkan.

## STANDAR MULTI-AGEN

Meskipun tidak menikmati lepas landas secepat MCP Anthropic, protokol lain yang mendapatkan kecepatan pada musim semi 2025 adalah **A2A** Google.

Sementara semua materi multi-agen yang telah kita bahas sejauh ini berkaitan dengan bagaimana Anda akan mengatur banyak agen dengan asumsi Anda mengendalikan semuanya, A2A adalah protokol untuk berkomunikasi dengan agen "**tidak tepercaya**" (_untrusted_).

Seperti MCP, A2A memecahkan masalah **n x n**. Jika ada _n_ agen yang berbeda, yang masing-masing menggunakan kerangka kerja yang berbeda, Anda harus menulis _n x m_ integrasi yang berbeda untuk membuat mereka bekerja sama.

### Cara kerja A2A

A2A bergantung pada file metadata JSON yang di-_host_ di

`/.well-known/agent.json` yang menjelaskan apa yang dapat dilakukan agen, URL _endpoint_-nya, dan persyaratan otentikasi.

Setelah otorisasi terjadi, dan dengan asumsi agen telah mengimplementasikan protokol klien dan server A2A, mereka dapat mengirim tugas satu sama lain dengan sistem antrian.

Tugas memiliki ID unik dan berlanjut melalui status seperti `submitted`, `working`, `input-required`, `completed`, `failed`, atau `canceled`. A2A mendukung pola sinkron **permintaan-respons** dan **_streaming_** untuk tugas yang berjalan lebih lama menggunakan _Server-Sent Events_.

Komunikasi terjadi melalui HTTP dan JSON-RPC 2.0, dengan pesan yang berisi bagian (teks, file, atau data terstruktur). Agen dapat menghasilkan artefak sebagai output dan mengirim pembaruan \_real-time* melalui *server-side events\*. Komunikasi menggunakan otentikasi web standar — OAuth, kunci API, kode HTTP, dan sebagainya.

### A2A vs. MCP

A2A lebih muda dari MCP, dan sementara Microsoft mendukung A2A, baik OpenAI maupun Anthropic belum bergabung. Ada kemungkinan mereka melihat MCP sebagai pesaing A2A. Waktu yang akan menentukan.

Bagaimanapun, harapkan satu atau beberapa protokol **interoperabilitas agen** dari pemain besar muncul sebagai standar _default_.

Principles of Building AI Agents 99

# BAGIAN VII

EVALUASI (\_EVALS\*)

## EVALUASI 101

Sementara tes perangkat lunak tradisional memiliki kondisi lulus/gagal yang jelas, output AI bersifat **non-deterministik** — mereka dapat bervariasi dengan input yang sama. _Evals_ membantu menjembatani kesenjangan ini dengan menyediakan metrik yang dapat diukur untuk mengukur kualitas agen.

Alih-alih hasil lulus/gagal biner, _evals_ mengembalikan **skor antara 0 dan 1**.

Anggap saja _evals_ seperti memasukkan, katakanlah, pengujian kinerja dalam _pipeline_ CI Anda. Akan ada beberapa keacakan dalam setiap hasil, tetapi secara keseluruhan dan dari waktu ke waktu harus ada **korelasi** antara kinerja aplikasi dan hasil tes.

Saat menulis _evals_, penting untuk memikirkan apa sebenarnya yang ingin Anda uji.

Ada berbagai jenis _evals_ sama seperti ada berbagai jenis tes.

Tes unit mudah ditulis dan dijalankan tetapi mungkin tidak menangkap perilaku yang penting; tes _end-to-end_ mungkin menangkap perilaku yang tepat tetapi mungkin lebih _flaky_.

Demikian pula, jika Anda membangun _pipeline_ RAG, atau alur kerja terstruktur, Anda mungkin ingin menguji setiap langkah di sepanjang jalan, dan kemudian setelah itu menguji perilaku sistem secara keseluruhan.

# EVALUASI TEKSTUAL (_TEXTUAL EVALS_)

_Evals_ tekstual bisa terasa seperti asisten mahasiswa pascasarjana yang menilai pekerjaan rumah Anda dengan rubrik. Mereka akan sedikit **pedantik**, tetapi mereka biasanya memiliki poin.

### Akurasi dan keandalan

Anda dapat mengevaluasi seberapa **benar**, **jujur**, dan **lengkap** jawaban agen Anda. Sebagai contoh:

- **Halusinasi.** Apakah respons mengandung fakta atau klaim yang tidak ada dalam konteks yang disediakan? Ini sangat penting untuk aplikasi RAG.
- **Kesetiaan (_Faithfulness_).** Apakah respons secara akurat mewakili konteks yang disediakan?
- **Kemiripan konten (_Content similarity_).** Apakah respons mempertahankan informasi yang konsisten di berbagai ungkapan?
- **Kelengkapan (_Completeness_).** Apakah respons mencakup semua informasi yang diperlukan dari input atau konteks?
- **Relevansi jawaban (_Answer relevancy_).** Seberapa baik respons menangani kueri asli?

### Memahami konteks

Anda dapat mengevaluasi seberapa baik agen Anda menggunakan konteks yang disediakan, misalnya kutipan yang diambil dari sumber, fakta dan statistik, dan detail pengguna yang ditambahkan ke konteks. Sebagai contoh:

- **Posisi konteks (_Context position_).** Di mana konteks muncul dalam respons? (Biasanya posisi yang benar untuk konteks adalah di bagian atas.)
- **Presisi konteks (_Context precision_).** Apakah potongan konteks dikelompokkan secara logis? Apakah respons mempertahankan makna asli?
- **Relevansi kontekstual (_Context relevancy_).** Apakah respons menggunakan potongan konteks yang paling sesuai?
- **Pengenalan kontekstual (_Contextual recall_).** Apakah respons sepenuhnya "mengenali" konteks yang disediakan?

### Output

Anda dapat mengevaluasi seberapa baik model memberikan jawaban akhirnya sesuai dengan persyaratan seputar **format**, **gaya**, **kejelasan**, dan **penyelarasan**.

- **Konsistensi nada (_Tone consistency_).** Apakah respons mempertahankan tingkat formalitas, kompleksitas teknis, nada emosional, dan gaya yang benar?
- **Penyelarasan Prompt (_Prompt Alignment_).** Apakah respons mengikuti instruksi eksplisit seperti batasan panjang, elemen yang diperlukan, dan persyaratan pemformatan tertentu?
- **Kualitas Ringkasan (_Summarization Quality_).** Apakah respons memadatkan informasi secara akurat? Pertimbangkan misalnya retensi informasi, akurasi faktual, dan keringkasan?
- **Cakupan Kata Kunci (_Keyword Coverage_).** Apakah respons menyertakan istilah teknis dan penggunaan terminologi?

Metrik _eval_ output lainnya seperti deteksi **toksisitas & bias** penting tetapi sebagian besar sudah tertanam dalam model terkemuka.

### Contoh Kode

Berikut adalah contoh dengan tiga metrik evaluasi berbeda yang secara otomatis memeriksa output agen penulisan konten untuk akurasi, kesetiaan pada materi sumber, dan potensi halusinasi:

```typescript
import { Agent } from "@mastra/core/agent"
import { openai } from "@ai-sdk/openai"

import { FaithfulnessMetric, ContentSimilarityMetric, HallucinationMetric } from "@mastra/evals/nlp"

// Konfigurasi agen dengan larik evals
export const myAgent = new Agent({
  name: "ContentWriter",
  instructions: "You are a content writer that creates accurate",
  model: openai("gpt-4o"),
  evals: [
    new FaithfulnessMetric(), // Memeriksa apakah output cocok dengan materi sumber
    new ContentSimilarityMetric({
      threshold: 0.8, // Membutuhkan kemiripan 80% dengan output yang diharapkan
    }),
    new HallucinationMetric(),
  ],
})
```

# EVALUASI LAIN

Ada beberapa jenis _evals_ lain juga.

## Evaluasi Klasifikasi atau Pelabelan

**Evaluasi klasifikasi atau pelabelan** membantu menentukan seberapa akurat model menandai atau mengkategorikan data berdasarkan kategori yang telah ditentukan (misalnya, sentimen, topik, spam vs. bukan spam).

Ini dapat mencakup tugas pelabelan luas (seperti mengenali **niat dokumen**) atau tugas **butir halus** (_fine-grained_) (seperti mengidentifikasi entitas spesifik yang dikenal sebagai _entity extraction_).

## Evaluasi Penggunaan Alat Agen

**Penggunaan alat** atau **_evals_ agen** mengukur seberapa efektif model atau agen memanggil alat atau API eksternal untuk memecahkan masalah.

Misalnya, seperti Anda akan menulis `expect(Fn).toBeCalled` dalam kerangka kerja pengujian JavaScript Jest, Anda akan menginginkan fungsi serupa untuk penggunaan alat agen.

### Evaluasi Rekayasa Prompt

**Evaluasi rekayasa _prompt_** mengeksplorasi bagaimana instruksi, format, atau ungkapan kueri pengguna yang berbeda memengaruhi kinerja agen.

Mereka melihat sensitivitas agen terhadap variasi _prompt_ (apakah perubahan kecil menghasilkan perbedaan besar dalam hasil) dan ketahanan terhadap input yang **bermusuhan** (_adversarial_) atau **ambigu**.

Semua hal "**_prompt injection_**" termasuk dalam kategori ini.

### Pengujian A/B

Setelah Anda meluncurkan, tergantung pada lalu lintas Anda, sangat mungkin untuk menjalankan **eksperimen langsung** dengan pengguna nyata untuk membandingkan dua versi sistem Anda.

Bahkan, para pemimpin perusahaan AI alat pengembang dan konsumen yang lebih besar, seperti Perplexity dan Replit, bercanda bahwa mereka lebih mengandalkan **pengujian A/B** metrik pengguna daripada _evals_ itu sendiri. Mereka memiliki cukup lalu lintas sehingga degradasi kualitas agen akan cepat terlihat.

## Tinjauan Data Manusia

Selain tes otomatis, tim AI berkinerja tinggi secara teratur meninjau data produksi. Biasanya, cara termudah untuk melakukan ini adalah dengan melihat **jejak** yang menangkap input dan output dari setiap langkah dalam _pipeline_. Kami membahas ini sebelumnya di bagian alur kerja dan _deployment_.

Banyak aspek kebenaran (misalnya, pengetahuan domain yang halus, atau permintaan pengguna yang tidak biasa) tidak dapat sepenuhnya ditangkap oleh pernyataan yang kaku, tetapi mata manusia menangkap nuansa ini.

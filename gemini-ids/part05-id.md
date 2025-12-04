# BAGIAN VIII

PENGEMBANGAN & DEPLOYMENT

## PENGEMBANGAN LOKAL

Pengembangan agent biasanya terbagi menjadi dua kategori berbeda: membangun sisi frontend dan sisi backend.

### Membangun frontend web agentik

Frontend agent berbasis web cenderung memiliki beberapa karakteristik yang sama: mereka dibangun di sekitar **antarmuka chat**, melakukan **streaming** ke backend, melakukan **autoscroll**, dan menampilkan **panggilan tools** (tool calls).

Kami telah membahas pentingnya _streaming_ di bab sebelumnya. Antarmuka agentik cenderung menggunakan berbagai opsi transport yang berbeda, seperti permintaan/respons (_request/response_), _server-sent events_, _webhooks_, dan _web sockets_, yang semuanya bertujuan untuk memberikan kesan interaktivitas _real-time_.

Ada beberapa framework yang kami lihat mempercepat pengembangan di sini, terutama selama fase prototipe: **Assistant UI**, **Copilot Kit**, dan **AI SDK UI** dari Vercel.

(Dan banyak agent didasarkan pada platform lain seperti WhatsApp, Slack, atau email dan tidak memiliki frontend web!)

Penting untuk dicatat bahwa meskipun frontend agentik dapat menjadi _powerful_, logika agent secara keseluruhan umumnya tidak dapat dijalankan di sisi klien (browser) karena alasan **keamanan** — hal itu akan membocorkan kunci API (_API keys_) Anda kepada penyedia LLM.

### Membangun backend agent

Jadi, di sisi **backend** lah kita biasanya melihat sebagian besar kompleksitas.

Saat mengembangkan aplikasi AI, penting untuk melihat apa yang dilakukan agent Anda, memastikan tools Anda berfungsi, dan dapat melakukan iterasi dengan cepat pada _prompts_ Anda.

Beberapa hal yang kami lihat sangat membantu untuk pengembangan agent lokal:

- **Antarmuka Chat Agent:** Uji percakapan dengan agent Anda di browser, lihat bagaimana mereka merespons input yang berbeda dan menggunakan tools yang telah dikonfigurasi.
- **Visualizer Workflow:** Melihat eksekusi workflow langkah demi langkah dan dapat menangguhkan/melanjutkan/memutar ulang (_suspend/resume/replay_).
- **Endpoints Agent/Workflow:** Mampu melakukan _curl_ ke agent dan workflow pada _localhost_ (ini juga memungkinkan penggunaan, misalnya, Postman).
- **Tool Playground:** Menguji setiap tool dan dapat memverifikasi input/output tanpa perlu memanggilnya melalui agent.
- **Tracing & Evals:** Melihat input dan output dari setiap langkah eksekusi agent dan workflow, serta metrik evaluasi (eval metrics) saat Anda mengulang kode.

Berikut adalah tangkapan layar dari lingkungan pengembangan lokal Mastra:

![image](images/image22.jpg)

## DEPLOYMENT (PENGGELARAN)

Pada Mei 2025, kita masih berada di era **Heroku** dalam deployment agent.

Sebagian besar tim menempatkan agent mereka ke dalam

semacam **web server**, kemudian memasukkan server itu ke dalam **image Docker** dan mendeploy-nya ke platform yang akan melakukan **scaling**.

Meskipun aplikasi web sudah cukup dipahami sehingga kita dapat membuat kemajuan pada paradigma deployment _serverless_ (Vercel, Render, AWS Lambda, dll.), agent belum mencapai titik itu.

### Tantangan deployment

Relatif terhadap siklus permintaan/respons web biasa, beban kerja agent (_agent workloads_) agak lebih rumit.

Mereka sering kali **berjalan lama** (_long-running_), mirip dengan beban kerja pada _durable execution engines_ seperti

Temporal dan Inngest. Namun, mereka masih terikat pada permintaan pengguna tertentu.

Jika dijalankan pada platform _serverless_, proses yang berjalan lama dapat menyebabkan **timeout fungsi**. Selain itu, ukuran bundle (_bundle sizes_) bisa terlalu besar, dan beberapa host _serverless_ tidak mendukung _runtime Node.js_ secara penuh.

### Menggunakan platform terkelola

Tim agent yang tidur paling nyenyak adalah mereka yang kami lihat berhasil menjalankan agent mereka menggunakan layanan terkelola dengan **auto-scaling**.

Penyedia _serverless_ (umumnya) belum mencapai tahap itu — proses yang berjalan lama dapat menyebabkan _timeout_ fungsi, dan ukuran _bundle_ menjadi masalah.

Tim yang menggunakan layanan kontainer seperti **AWS EC2**, **Digital Ocean**, atau yang setara tampaknya baik-baik saja selama mereka memiliki kasus penggunaan **B2B** yang tidak akan mengalami lonjakan penggunaan yang tiba-tiba.

(Dan tentu saja, di Mastra, kami memiliki layanan cloud beta dengan _autoscaling_)

# BAGIAN IX

SEGALA SESUATU YANG LAIN

## MULTIMODAL

Salah satu cara untuk memikirkan tentang **multimodality** (gambar, video, suara) dalam AI adalah dengan memetakan tanggal kemunculannya di berbagai platform.

Pertimbangkan Internet: ia mendukung **teks** sejak kemunculannya di tahun 1970-an, tetapi **gambar** dan **video** tidak didukung sampai adanya _web browser_ (1992), dan **suara** tidak sampai tahun 1995.

Suara dan video tidak menjadi populer sampai **YouTube** (2002) dan **Skype** (2003), dengan bandwidth dan kecepatan koneksi yang lebih besar.

Atau pikirkan tentang jejaring sosial: semua yang awal, seperti **MySpace** (2002), **Facebook** (2004), dan **Twitter** (2008), pada dasarnya berbasis teks.

Media sosial berbasis **gambar** tidak menjadi populer sampai **Instagram** (2010) dan **Snapchat** (2013), dan media sosial berbasis **video** sampai **TikTok** (2017).

Dalam AI, maka, tidak heran jika kasus penggunaan _multi-modal_ sedikit lebih muda dan kurang matang. Seperti pada platform sebelumnya, mereka lebih sulit untuk disempurnakan, dan lebih kompleks secara komputasi.

### Image Generation (Generasi Gambar)

Maret 2025 membawa penemuan **Ghibli-core** — bayangkan warna-warna lembut, latar belakang yang melamun, dan karakter-karakter bermata lebar yang ikonik.

Orang-orang sudah bermain dengan Midjourney, Stable Diffusion, dan lainnya selama beberapa waktu. Tetapi Maret adalah langkah maju dalam generasi gambar tingkat konsumen, dengan kemampuan untuk **mentranspos foto ke dalam gaya tertentu**.

Orang-orang mengunggah _selfie_ atau foto lama, menambahkan _prompt_, dan langsung mendapatkan kembali versi anime yang tampak seperti keluar dari "Spirited Away."

![image](images/image18.jpg)
di pertandingan basket

Ini bukan hanya hal yang _niche_; tren Ghibli mengambil alih _social feeds_ di mana-mana. Akun resmi Gedung Putih (Trump) ikut bergabung dengan (kontroversial) men-tweet gambar imigran yang ditahan yang telah di-Ghibli-fikasi.

Secara lebih luas, momen "Ghibli" menunjukkan vitalitas untuk kasus penggunaan seni digital — generasi gambar untuk sesuatu yang berada di antara _storyboard_, _character sketch_, dan konsep lingkungan.

### Kasus Penggunaan

Dalam hal orang yang menggunakan generasi gambar untuk produk, ada beberapa kasus penggunaan.

Dalam pemasaran dan _e-commerce_, maket produk (_product mockups_)

dengan latar belakang yang bervariasi dan pembuatan kreatif iklan yang cepat tanpa sesi foto dan dalam berbagai faktor bentuk. Model gambar "coba-pakai" (_"try-on"_) memungkinkan orang untuk menukar model manusia tetapi mempertahankan item pakaian yang ditampilkan.

Kasus penggunaan ketiga untuk generasi gambar adalah dalam produksi video game dan film. Generasi gambar telah memungkinkan prototipe aset, termasuk potret, tekstur, _props_, serta perencanaan tata letak adegan melalui alur "sketsa ke render" (_sketch to render_) yang kasar.

Dalam istilah pengembangan web, ini memberikan _fidelity_ dari desain penuh dengan usaha/keterampilan dari _wireframe_.

Terakhir, ada lebih banyak kasus penggunaan **NSFW** (_Not Safe For Work_). Ini cenderung tidak dapat didanai oleh _venture capital_, tetapi setidaknya menurut gosip Silicon Valley, cukup banyak kasus penggunaan yang lebih risqué menghasilkan uang — jika Anda dapat menemukan pemroses pembayaran yang mau menerima bisnis Anda.

### Voice (Suara)

Modalitas utama dalam suara adalah _speech-to-text_ (**STT**), _text-to-speech_ (**TTS**), dan _speech-to-speech_, yang juga dikenal sebagai _realtime voice_.

Apa yang diinginkan pengguna dalam produk suara agent adalah sesuatu yang dapat **memahami nada** mereka, dan **merespons segera**.

Untuk melakukan itu, Anda dapat melatih model yang

secara khusus mengambil token suara sebagai input, dan merespons dengan token suara sebagai output. Itu dikenal sebagai **"real-time voice"** (_suara waktu nyata_), tetapi terbukti menantang.

Pertama, sulit untuk melatih model semacam itu; **kepadatan informasi audio hanya 1/1000 dari teks**, sehingga model-model ini membutuhkan data input yang jauh lebih banyak untuk dilatih dan biayanya lebih mahal untuk disajikan (_serve_).

Kedua, model-model ini masih kesulitan dengan **pengambilan giliran berbicara** (_turn-taking_), yang dikenal di industri sebagai "deteksi aktivitas suara" (_voice activity detection_). Saat berbicara, manusia saling menyela terus-menerus menggunakan isyarat visual dan emosional.

Tetapi model suara tidak memiliki isyarat ini, dan harus berurusan dengan latensi komputasi dan jaringan. Ketika mereka menyela terlalu cepat, mereka memotong pembicaraan orang; ketika mereka menyela terlalu lambat, mereka terdengar robotik.

Meskipun produk-produk ini menghasilkan demo yang bagus, tidak terlalu banyak perusahaan yang menggunakan _realtime voice_ dalam produksi.

Yang mereka gunakan sebagai gantinya adalah **pipeline speech-to-text (STT) dan text-to-speech (TTS)**. Mereka menggunakan satu model untuk menerjemahkan suara input menjadi teks, model lain untuk menghasilkan teks respons, dan kemudian menerjemahkan teks respons menjadi respons audio.

Berikut adalah contoh mendengarkan (_listening_); Anda dapat menindaklanjutinya dengan `agent.speak()` untuk membalas.

```javascript
import { Agent } from "@mastra/core/agent";
import { OpenAIVoice } from "@mastra/voice-openai";

const agent = new Agent({
 name: 'Agent',
 instructions: `You are a helpful assistant with
voice capabilities.`,
 model: openai('gpt-4o'),
 voice: new OpenAIVoice();
});

const audioStream =
 fs.createReadStream('/path/to.mp3')

const text = await agent.listen(audioStream)

// Hei! Apa kabar!
```

## Video

Produk generasi video AI, meskipun menarik, belum beralih dari _machine learning_ ke _AI engineering_.

Model-model konsumen belum mengalami momen Studio Ghibli mereka di mana mereka dapat secara akurat merepresentasikan karakter dalam input dan memutarnya kembali dalam pengaturan alternatif.

Akibatnya, produk cenderung memerlukan banyak pengetahuan khusus untuk dibangun, dan **mengonsumsi siklus GPU saat _runtime_** untuk menghasilkan avatar dari input pengguna yang kemudian dapat diputar ulang dalam pengaturan dan skenario baru.

# CODE GENERATION (GENERASI KODE)

Dengan lepas landasnya perusahaan seperti **bolt.new** dan **Lovable**, serta rilis coding agent dalam rentang waktu seminggu dari **OpenAI**, **Microsoft**, dan **Google**, telah muncul lonjakan orang yang tertarik untuk membangun coding agent mereka sendiri.

Memberikan agent Anda tool generasi kode membuka _workflow_ yang _powerful_, tetapi juga datang dengan pertimbangan **keamanan** dan **kualitas** yang penting.

Jadi, pertimbangkan hal-hal berikut:

- **Feedback Loops (Lingkaran Umpan Balik):** Agent dapat menulis kode, menjalankannya, dan menganalisis hasilnya. Misalnya, jika kode menghasilkan _error_, agent dapat membaca pesan _error_ dan mencoba lagi—memungkinkan peningkatan secara iteratif.
- **Sandboxing:** Selalu jalankan kode yang dihasilkan dalam **lingkungan _sandboxed_**. Ini mencegah agent secara tidak sengaja (atau jahat) menjalankan perintah berbahaya di mesin Anda (seperti `rm -rf /`).
- **Code Analysis (Analisis Kode):** Anda dapat memberi agent akses ke _linters_, _static type checkers_, dan tool analisis lainnya. Ini memberikan umpan balik _ground truth_ dan membantu agent menulis kode berkualitas lebih tinggi.

Jika Anda membangun _code agent_, Anda harus melihat secara mendalam tool dan platform yang berspesialisasi secara khusus dalam kasus penggunaan ini.

# APA SELANJUTNYA

Ruang agent bergerak sangat cepat.
Kami tidak memiliki bola kristal, tetapi dari sudut pandang kami sebagai _agent framework_ terkemuka, inilah yang kami lihat:

- **Model penalaran akan terus membaik.** Agent seperti Windsurf dan Cursor dapat memasukkan Claude 3.7, o4-mini-high, dan Claude 4, dan meningkatkan kinerja secara signifikan. Tetapi seperti apa rupa agent yang dibangun untuk model penalaran? Kami belum yakin.
- **Kami akan membuat kemajuan dalam pembelajaran agent.** Agent mengeluarkan _traces_, tetapi saat ini _feedback loop_ untuk meningkatkan kinerja mereka berjalan melalui programmer manusianya. Tim yang berbeda sedang mengerjakan pendekatan yang berbeda untuk pembelajaran agent (misalnya _supervised fine-tuning_ sebagai layanan). Tetapi masih belum jelas apa pendekatan yang tepat.
- **Evals sintetis.** Saat ini, penulisan _evals_ adalah proses intensif yang didorong manusia. Beberapa produk secara sintetis menghasilkan _evals_ dari data _tracing_, dengan persetujuan manusia, untuk kasus penggunaan khusus. Kami berharap itu akan berkembang selama beberapa bulan ke depan.
- **Keamanan akan menjadi lebih penting.** Saat saya menulis kata-kata ini, saya membaca tentang kerentanan di server MCP Github resmi yang akan membocorkan _private repos_, _API credentials_, dan sebagainya. Jumlah agent yang dideploy kemungkinan akan **10x atau 100x** selama beberapa bulan ke depan, dan kita akan melihat lebih banyak insiden seperti ini.
- **September abadi AI akan berlanjut.** Setiap bulan membawa pengembang baru yang belum belajar cara menulis _prompts_ yang baik atau apa itu _vector database_. Sementara itu, laju pembaruan model yang cepat berarti tim yang mapan pun terus-menerus mengadaptasi implementasi mereka. Di bidang di mana pijakan bergeser terus-menerus, kita semua adalah pemula abadi. Untuk membangun sesuatu yang bertahan lama, Anda harus tetap rendah hati.

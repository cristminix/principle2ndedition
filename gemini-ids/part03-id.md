# Perantaian (_Chaining_)

Ini adalah operasi yang paling sederhana. Terkadang, Anda ingin mengambil data dari sumber jarak jauh sebelum memasukkannya ke LLM, atau memasukkan hasil dari satu panggilan LLM ke panggilan LLM lainnya.

Di Mastra, Anda melakukan **perantaian** dengan perintah `.then()`. Berikut adalah contoh sederhana:

![image](images/image20.png)

Setiap langkah dalam rantai menunggu langkah sebelumnya selesai, dan memiliki akses ke hasil langkah sebelumnya melalui konteks.

---

## Penggabungan (_Merging_)

Setelah jalur **percabangan** menyimpang untuk menangani berbagai aspek tugas, mereka sering kali perlu **bertemu kembali** untuk menggabungkan hasilnya:

![image](images/image16.png)

---

## Kondisi (_Conditions_)

Terkadang alur kerja Anda perlu membuat keputusan berdasarkan hasil perantara.

Dalam grafik alur kerja, karena banyak jalur biasanya dapat dieksekusi secara paralel, di Mastra kita mendeffinisikan eksekusi jalur bersyarat pada **langkah anak** daripada langkah induk.

Dalam contoh ini, langkah `processData` sedang dieksekusi, bersyarat pada keberhasilan langkah `fetchData`.

```javascript
myWorkflow.step(
  new Step({
    id: "processData",
    execute: async ({ context }) => {
      // Logika aksi
    },
  }),
  {
    when
`{
      "fetchData.status": "success",
    },
  }
)
```

## Praktik Terbaik dan Catatan

Sangat membantu untuk menyusun langkah-langkah sedemikian rupa sehingga input/output pada setiap langkah **bermakna** dalam beberapa hal, karena Anda akan dapat melihatnya dalam pelacakan Anda. (Lebih lanjut segera di bagian Pelacakan).

Hal lain adalah memecah langkah-langkah sedemikian rupa sehingga LLM hanya perlu melakukan **satu hal pada satu waktu**. Ini biasanya berarti tidak lebih dari satu panggilan LLM di setiap langkah.

Banyak kasus khusus yang berbeda dari grafik alur kerja, seperti perulangan, percobaan ulang, dll. dapat dibuat dengan menggabungkan primitif-primitif ini.

---

## JEDA DAN LANJUTKAN (_SUSPEND AND RESUME_)

Terkadang alur kerja perlu **menjeda eksekusi** sambil menunggu pihak ketiga (seperti **manusia-dalam-loop**) untuk memberikan input.

Karena pihak ketiga dapat membutuhkan waktu yang sangat lama untuk merespons, Anda tidak ingin membiarkan proses berjalan terus-menerus.

Sebaliknya, Anda ingin mempertahankan **status alur kerja**, dan memiliki beberapa fungsi yang dapat Anda panggil untuk melanjutkan dari bagian yang Anda tinggalkan.

Mari kita buat diagram contoh sederhana dengan Mastra, yang memiliki fungsi `.suspend()` dan `.resume()`:

Untuk menangani alur kerja yang dijeda, Anda dapat mengamati perubahan status dan melanjutkan eksekusi saat siap:

Berikut adalah contoh sederhana pembuatan alur kerja dengan jeda dan lanjutkan di Mastra.

Langkah-langkah adalah blok bangunan dari alur kerja.

Buat langkah menggunakan `createStep`:

```typescript
// Buat langkah dengan skema input/output yang ditentukan dan logika eksekusi
const inputSchema = z.object({
 inputValue: z.string(),
});

const myStep = createStep({
 id: "my-step",
 description: "Melakukan sesuatu yang berguna.",
 inputSchema,
 outputSchema: z.object({
   outputValue: z.string(),
 }),

 // Opsional: Tentukan skema resume untuk melanjutkan langkah
 resumeSchema: z.object({
   resumeValue: z.string(),
 }),

 // Opsional: Tentukan skema jeda untuk menjeda langkah
 suspendSchema: z.object({
   suspendValue: z.string(),
 }),

 execute: async ({
   inputData,
   Maestra,
   getStepResult,
   getInitData,
   runtimeContext,
 }) => {
   const otherStepOutput = getStepResult(step2);
   const initData = getInitData<typeof inputSchema>(); // diketik sebagai skema input
                                                     // variabel (skema zod)
   return {
     outputValue: `Diproses: ${inputData.inputValue}, ${initData.startValue}`,
     {runtimeContextValue: `${runtimeContext.get("runtimeContextValue")}`},
   };
 },
});
```

Kemudian buat alur kerja menggunakan `createWorkflow`:

```typescript
// Buat alur kerja dengan langkah-langkah yang ditentukan dan alur eksekusi
const myWorkflow = createWorkflow({
  id: "my-workflow",
  // Tentukan struktur input yang diharapkan (harus cocok dengan inputSchema langkah pertama)
  inputSchema: z.object({
    startValue: z.string(),
  }),
  // Tentukan struktur output yang diharapkan (harus cocok dengan outputSchema langkah terakhir)
  outputSchema: z.object({
    result: z.string(),
  }),
  steps: [step1, step2, step3], // Deklarasikan langkah-langkah yang digunakan dalam alur kerja ini
})
  .then(step1)
  .then(step2)
  .then(step3)
  .commit()

// Daftarkan alur kerja dengan instance Maestra
const maestra = new Maestra({
  vnext_workflows: {
    myWorkflow,
  },
})

// Buat instance lari dari alur kerja
const run = maestra.vnext_getWorkflow("myWorkflow").createRun()
```

Setelah mendefinisikan alur kerja, jalankan seperti ini:

```javascript
// Buat instance lari
const run = myWorkflow.createRun()

// Mulai alur kerja dengan data input
const result = await run.start({
  inputData: {
    startValue: "initial data",
  },
})

// Akses hasilnya
console.log(result.steps) // Semua hasil langkah
console.log(result.steps["step-id"].output) // Output dari langkah tertentu

if (result.status === "success") {
  console.log(result.result) // Hasil akhir dari alur kerja, hasil dari langkah terakhir
  // langkah (atau output .map(), jika digunakan sebagai langkah terakhir)
} else if (result.status === "suspended") {
  const resumeResult = await run.resume({
    step: result.suspended[0], // selalu ada setidaknya satu id langkah di larik yang dijeda
    // dalam hal ini kita melanjutkan jalur eksekusi yang dijeda pertama
    resumeData: {
      /* input pengguna */
    },
  })
} else if (result.status === "failed") {
  console.error(result.error) // hanya ada jika status gagal, ini adalah instance dari
  // Error
}
```

## PEMBARUAN STREAMING (_STREAMING UPDATES_)

Salah satu kunci untuk membuat aplikasi LLM terasa cepat dan responsif adalah menunjukkan kepada pengguna apa yang terjadi saat

model sedang bekerja. Kami telah mengirimkan beberapa peningkatan besar di sini, dan demo baru kami benar-benar menunjukkan apa yang dapat dilakukan oleh **_streaming_** modern.

Mari kita tinjau kembali upaya saya yang berkelanjutan (dan masih belum berhasil) untuk merencanakan perjalanan ke Hawaii.

Tahun lalu, saya mencoba dua model penalaran berdampingan: o1 pro OpenAI (tab kiri) dan Deep Research (tab kanan).

O1 pro hanya menunjukkan kotak "penalaran" yang berputar selama tiga menit — tidak ada umpan balik, hanya menunggu. Deep Research, di sisi lain, segera meminta saya untuk detail (jumlah orang, anggaran, kebutuhan diet), lalu mengalirkan kembali pembaruan saat ia

menemukan restoran dan atraksi. Rasanya jauh lebih cepat dan membuat saya terus mengetahui perkembangannya.

Kiri: o1 pro (kurang baik). Kanan: Deep Research (lebih baik)

### Cara streaming dari dalam fungsi

Inilah masalahnya: ketika Anda membangun agen LLM, Anda biasanya melakukan _streaming_ di tengah fungsi yang mengharapkan tipe kembalian tertentu. Terkadang, Anda harus menunggu seluruh output LLM sebelum fungsi dapat mengembalikan hasil kepada pengguna. Tetapi bagaimana jika fungsinya memakan waktu lama? Di sinilah keadaan menjadi rumit. Idealnya, Anda ingin melakukan **_streaming_ kemajuan langkah demi langkah** kepada pengguna segera setelah Anda memilikinya, tidak hanya membuang semuanya di akhir.

Banyak orang yang meretas ini. Misalnya, Simon di Assistant UI menyiapkan aplikasinya untuk menulis setiap token dari OpenAI langsung ke database saat _streaming_ masuk, menggunakan ElectricSQL untuk langsung menyinkronkan

pembaruan tersebut ke frontend. Ini menciptakan semacam "**escape hatch**" (_jalan keluar_)—bahkan jika fungsinya belum selesai, pengguna melihat kemajuan langsung.

### Mengapa streaming itu penting

Hal yang paling umum untuk di-_stream_ adalah output LLM itu sendiri (menampilkan token saat dihasilkan). Tetapi Anda juga dapat melakukan _streaming_ pembaruan dari setiap langkah dalam alur kerja multi-langkah atau _pipeline_ agen, seperti ketika agen sedang mencari, merencanakan, dan meringkas secara berurutan.

Ini membuat pengguna tetap **terlibat dan diyakinkan** bahwa semuanya berjalan lancar, meskipun _backend_ masih bekerja keras.

### Cara Membangun Ini

- _Stream_ sebanyak mungkin: Baik itu token, langkah alur kerja, atau data kustom, sampaikan ke pengguna **ASAP** (sesegera mungkin).
- Gunakan alat reaktif: Pustaka seperti ElectricSQL atau kerangka kerja seperti Turbo Streams membuatnya lebih mudah untuk menyinkronkan pembaruan \_backend\* langsung ke UI.
- **Escape hatches**: Jika fungsi Anda macet menunggu, temukan cara untuk mendorong hasil parsial atau pembaruan kemajuan ke _frontend_.

Intinya: _Streaming_ bukan hanya hal yang _nice-to-have_ — ini **penting untuk UX yang baik** dalam aplikasi LLM. Pengguna ingin

melihat kemajuan, bukan hanya layar kosong. Jika Anda berhasil melakukannya, agen Anda akan terasa lebih cepat dan lebih andal, meskipun _backend_ masih bekerja keras.

Sekarang, coba saja _streaming_ dapat membantu saya benar-benar sampai ke Hawaii...

---

## OBSERVABILITAS DAN PELACAKAN (_TRACING_)

Karena LLM bersifat **non-deterministik**, pertanyaannya bukanlah apakah aplikasi Anda akan menyimpang.

Melainkan **kapan** dan **seberapa banyak**.

Tim yang telah mengirimkan agen ke produksi biasanya berbicara tentang betapa pentingnya melihat data produksi untuk setiap langkah, dari setiap eksekusi, dari setiap alur kerja mereka.

Kerangka kerja agen seperti Mastra yang memungkinkan Anda menulis kode sebagai grafik alur kerja terstruktur juga akan memancarkan **telemetri** yang memungkinkan hal ini.

## Observabilitas

Observabilitas adalah kata yang sering diperbincangkan, tetapi karena maknanya sebagian besar telah diencerkan dan digeneralisasi oleh vendor yang mementingkan diri sendiri, mari kita kembali ke akarnya.

Istilah awal dipopulerkan oleh Charity Majors dari Honeycomb pada akhir tahun 2010-an untuk menggambarkan kualitas untuk dapat memvisualisasikan **jejak aplikasi** (_application traces_).

## Pelacakan (_Tracing_)

Untuk men-debug sebuah fungsi, akan sangat menyenangkan untuk dapat melihat **input dan output** dari setiap fungsi yang dipanggilnya. Dan input dan output dari setiap fungsi yang dipanggil oleh fungsi-fungsi tersebut. (Dan seterusnya, dan seterusnya, kura-kura sepanjang jalan ke bawah.)

Jenis telemetri ini disebut **jejak** (_trace_), yang terdiri dari pohon **_span_**. (Pikirkan tentang dokumen HTML bersarang, atau diagram api (\_flame chart\*)).

Format standar untuk jejak dikenal sebagai **OpenTelemetry**, atau **OTel** singkatnya. Ketika vendor pemantauan mulai mendukung pelacakan, masing-masing memiliki spesifikasi yang berbeda — tidak ada portabilitas. Ben Sigelman dari Lightstep membantu menciptakan standar Otel yang umum, dan vendor yang lebih besar seperti Datadog (di bawah paksaan) mulai mendukung Otel.

Ada sejumlah besar vendor observabilitas, baik _backend_ lama maupun yang khusus AI, tetapi pola UI menyatu:

Contoh layar pelacakan

Apa yang diberikan oleh jenis layar UI ini kepada Anda adalah:

- **Tampilan jejak (_trace view_).** Ini menunjukkan berapa lama waktu yang dibutuhkan setiap langkah dalam _pipeline_ (misalnya, `parse_input`, `process_request`, `api_call`, dll.)
- **Inspeksi input/output.** Melihat "Input" dan "Output" yang tepat dalam JSON sangat membantu untuk men-debug data yang mengalir masuk dan keluar dari LLM.
- **Metadata panggilan.** Menampilkan status, waktu mulai/akhir, latensi, dll.) memberikan konteks kunci di sekitar setiap eksekusi, membantu manusia memindai anomali.

### Evals

Juga menyenangkan untuk dapat melihat **evals** Anda (lebih lanjut tentang _evals_ nanti) di lingkungan _cloud_.

Untuk setiap _eval_ mereka, orang ingin melihat **perbandingan berdampingan** tentang bagaimana agen merespons versus apa yang diharapkan.

Mereka ingin melihat **skor keseluruhan** pada setiap PR (untuk memastikan tidak ada regresi), dan skor dari waktu ke waktu, dan untuk memfilter berdasarkan tag, tanggal eksekusi, dan sebagainya.

UI Eval cenderung terlihat seperti ini:

Contoh layar evaluasi

### Catatan akhir tentang observabilitas dan pelacakan

Anda akan memerlukan **alat _cloud_** untuk melihat jenis data ini untuk aplikasi produksi Anda.

Juga menyenangkan untuk dapat melihat data ini **secara lokal** saat Anda mengembangkan (Mastra melakukan ini). Lebih lanjut tentang ini di bagian pengembangan lokal.

Ada standar umum yang disebut **OpenTelemetry**, atau **OTel** singkatnya, dan kami sangat menyarankan untuk memancarkan dalam format tersebut.

<?php

return [
    // ---------------------------------------------------------------------------------------------------------
    // FORMULIR STANDAR EHS: F-GRK/EHS-810-24-012 (INSPEKSI TANGGA PORTABLE WILMAR - GRESIK)
    // ---------------------------------------------------------------------------------------------------------
    'portable' => [
        [
            'title' => 'Formulir Standar EHS - Inspeksi Tangga Portable (F-GRK/EHS-810-24-012)',
            'items' => [
                ['key' => 'label_kapasitas_terbaca', 'label' => '1. Label kapasitas beban masih terbaca'],
                ['key' => 'nomor_identifikasi_tersedia', 'label' => '2. Nomor identifikasi tersedia'],
                ['key' => 'label_keselamatan_terbaca', 'label' => '3. Label Keselamatan Terbaca'],
                ['key' => 'side_rail_tidak_bengkok', 'label' => '4. Side rail tidak bengkok'],
                ['key' => 'side_rail_tidak_retak', 'label' => '5. Side rail tidak retak'],
                ['key' => 'anak_tangga_lengkap', 'label' => '6. Anak tangga lengkap'],
                ['key' => 'anak_tangga_tidak_retak_bengkok', 'label' => '7. Anak tangga tidak retak/bengkok'],
                ['key' => 'sambungan_baut_rivet_tidak_longgar', 'label' => '8. Sambungan baut/rivet tidak longgar'],
                ['key' => 'tidak_ada_korosi_berlebihan', 'label' => '9. Tidak ada korosi berlebihan'],
                ['key' => 'tidak_ada_modifikasi_tidak_standar', 'label' => '10. Tidak ada modifikasi tidak standar'],
                ['key' => 'karet_kaki_utuh', 'label' => '11. Karet kaki utuh'],
                ['key' => 'anti_slip_berfungsi', 'label' => '12. Anti-slip berfungsi'],
                ['key' => 'spreader_bar_berfungsi', 'label' => '13. Spreader bar berfungsi'],
                ['key' => 'locking_mechanism_berfungsi', 'label' => '14. Locking mechanism berfungsi'],
                ['key' => 'tali_pulley_baik_extension', 'label' => '15. Tali pulley baik (extension)'],
                ['key' => 'pengunci_extension_baik', 'label' => '16. Pengunci extension baik'],
                ['key' => 'bebas_minyak_oli', 'label' => '17. Bebas minyak/oli'],
                ['key' => 'bebas_lumpur', 'label' => '18. Bebas lumpur'],
                ['key' => 'anak_tangga_tidak_licin', 'label' => '19. Anak tangga tidak licin'],
                ['key' => 'permukaan_stabil', 'label' => '20. Permukaan stabil'],
                ['key' => 'area_bebas_hambatan', 'label' => '21. Area bebas hambatan'],
                ['key' => 'kondisi_platform_handrail', 'label' => '22. Kondisi platform & Handrail'],
                ['key' => 'jauh_dari_listrik', 'label' => '23. Jauh dari listrik'],
                ['key' => 'sudut_4_1_sesuai', 'label' => '24. Sudut 4:1 sesuai'],
                ['key' => 'menjulur_minimal_1m_landing', 'label' => '25. Menjulur ≥1 m di landing'],
            ],
        ],
    ],

    // ---------------------------------------------------------------------------------------------------------
    // FORMULIR STANDAR EHS: INSPEKSI TANGGA TETAP & FALL ARREST SYSTEM (WILMAR - GRESIK)
    // ---------------------------------------------------------------------------------------------------------
    'permanent' => [
        [
            'title' => 'Fixed Anchor Points',
            'items' => [
                ['key' => 'anchor_sambungan_sendi_longgar', 'label' => 'Sambungan, Sendi, Pintu atau Penghubung yang Longgar'],
                ['key' => 'anchor_paku_keling_baut_aman', 'label' => 'Paku keling, sekrup, mur, baut, dll. aman'],
                ['key' => 'anchor_baut_memanjang_2_ulir', 'label' => 'Baut memanjang minimal 2 ulir'],
                ['key' => 'anchor_baut_pengait_terpasang_benar', 'label' => 'Baut pengait terpasang dengan benar sesuai dengan desain pemasangan'],
                ['key' => 'anchor_cat_kontaminasi_lain', 'label' => 'Bebas Cat atau Kontaminasi Lainnya'],
                ['key' => 'anchor_tepi_tajam', 'label' => 'Bebas Tepi Tajam'],
                ['key' => 'anchor_korosi_karat_pengikisan', 'label' => 'Bebas Korosi / Karat / Pengikisan'],
                ['key' => 'anchor_permukaan_berdebu_kimia', 'label' => 'Bebas Permukaan berdebu (kerusakan akibat bahan kimia)'],
                ['key' => 'anchor_retak_bengkok_terpelintir_las', 'label' => 'Bebas Retak, Bengkok, Terpelintir, Terlas (terutama di titik kontak)'],
                ['key' => 'anchor_label_pengujian_teridentifikasi', 'label' => 'Label pengujian dapat teridentifikasi dengan jelas'],
                ['key' => 'anchor_label_pabrikan_terbaca', 'label' => 'Label pabrikan jelas dan mudah terbaca'],
                ['key' => 'anchor_tanda_ansi_osha_csa', 'label' => 'Tanda ANSI / OSHA / CSA sesuai'],
            ],
        ],
        [
            'title' => 'Fixed Ladder / Climbing System',
            'items' => [
                ['key' => 'climbing_sambungan_longgar', 'label' => 'Sambungan, Sendi, atau Penghubung yang Longgar'],
                ['key' => 'climbing_paku_keling_baut_aman', 'label' => 'Paku keling, sekrup, mur, baut, dll. aman'],
                ['key' => 'climbing_baut_memanjang_2_ulir', 'label' => 'Baut memanjang minimal 2 ulir'],
                ['key' => 'climbing_korosi_karat_komponen', 'label' => 'Bebas Korosi / Karat pada Sistem atau Komponen Tambahan'],
                ['key' => 'climbing_permukaan_berdebu_kimia', 'label' => 'Bebas Permukaan berdebu (kerusakan akibat bahan kimia)'],
                ['key' => 'climbing_retak_bengkok_terlas', 'label' => 'Bebas Retak, Bengkok, Terpelintir, Terlas (terutama di titik kontak)'],
                ['key' => 'climbing_tepi_tajam', 'label' => 'Bebas Tepi Tajam'],
                ['key' => 'climbing_anak_tangga_bebas_kotoran', 'label' => 'Anak Tangga Bebas Kotoran, Minyak, atau Cat'],
                ['key' => 'climbing_pengamanan_braket_bawah', 'label' => 'Pengamanan braket bawah terpasang kokoh'],
                ['key' => 'climbing_label_pengujian_teridentifikasi', 'label' => 'Label pengujian dapat teridentifikasi dengan jelas'],
                ['key' => 'climbing_label_pabrikan_terbaca', 'label' => 'Label pabrikan jelas dan mudah dibaca'],
                ['key' => 'climbing_tanda_ansi_osha_csa', 'label' => 'Tanda ANSI / OSHA / CSA yang Sesuai'],
            ],
        ],
        [
            'title' => 'Horizontal Lifeline',
            'items' => [
                ['key' => 'lifeline_sambungan_longgar', 'label' => 'Sambungan, Sendi, Pintu atau Penghubung yang Longgar'],
                ['key' => 'lifeline_paku_keling_baut_aman', 'label' => 'Paku keling, sekrup, mur, baut, dll. aman'],
                ['key' => 'lifeline_baut_memanjang_2_ulir', 'label' => 'Baut memanjang minimal 2 ulir'],
                ['key' => 'lifeline_korosi_karat_komponen', 'label' => 'Bebas Korosi / Karat pada Sistem atau Komponen Tambahan'],
                ['key' => 'lifeline_permukaan_berdebu_kimia', 'label' => 'Bebas Permukaan berdebu (kerusakan akibat bahan kimia)'],
                ['key' => 'lifeline_pengangkut_lancar', 'label' => 'Pengangkut sistem beroperasi dengan lancar di seluruh sistem'],
                ['key' => 'lifeline_unit_pengencang_aman', 'label' => 'Unit pengencang aman'],
                ['key' => 'lifeline_penutup_wadah_bebas_retak', 'label' => 'Penutup dan wadah bebas dari retak, penyok, pecah'],
                ['key' => 'lifeline_label_pengujian_teridentifikasi', 'label' => 'Label pengujian dapat dikenali dengan jelas'],
                ['key' => 'lifeline_label_pabrikan_terbaca', 'label' => 'Label pabrikan jelas dan mudah dibaca'],
                ['key' => 'lifeline_tanda_ansi_osha_csa', 'label' => 'Tanda ANSI / OSHA / CSA yang Sesuai'],
            ],
        ],
        [
            'title' => 'Safety Nets Inspection',
            'items' => [
                ['key' => 'safetynet_sambungan_longgar', 'label' => 'Sambungan, Sendi, Pintu atau Penghubung yang Longgar'],
                ['key' => 'safetynet_paku_keling_baut_aman', 'label' => 'Paku keling, sekrup, mur, baut, dll. aman'],
                ['key' => 'safetynet_baut_memanjang_2_ulir', 'label' => 'Baut memanjang minimal 2 ulir'],
                ['key' => 'safetynet_korosi_karat_komponen', 'label' => 'Bebas Korosi / Karat pada Sistem atau Komponen Tambahan'],
                ['key' => 'safetynet_permukaan_berdebu_kimia', 'label' => 'Bebas Permukaan berdebu (kerusakan akibat bahan kimia)'],
                ['key' => 'safetynet_label_pengujian_teridentifikasi', 'label' => 'Label pengujian dapat dikenali dengan jelas'],
                ['key' => 'safetynet_label_pabrikan_terbaca', 'label' => 'Label pabrikan jelas dan mudah dibaca'],
                ['key' => 'safetynet_tanda_ansi_osha_csa', 'label' => 'Tanda ANSI / OSHA / CSA yang Sesuai'],
                ['key' => 'safetynet_bebas_material_asing', 'label' => 'Bebas dari material atau benda asing'],
            ],
        ],
        [
            'title' => 'Fixed Rail',
            'items' => [
                ['key' => 'rail_penyok_lubang_retak', 'label' => 'Bebas Penyok / Lubang / Retak pada rel'],
                ['key' => 'rail_tepi_tajam_gerigi', 'label' => 'Bebas Tepi tajam / Gerigi'],
                ['key' => 'rail_fitting_terpasang_benar', 'label' => 'Fitting rel terpasang dengan benar sesuai petunjuk pabrikan'],
                ['key' => 'rail_paku_keling_baut_aman', 'label' => 'Paku keling, sekrup, mur, baut, dll. aman'],
                ['key' => 'rail_baut_memanjang_2_ulir', 'label' => 'Baut memanjang minimal 2 ulir'],
                ['key' => 'rail_korosi_karat_komponen', 'label' => 'Bebas Korosi / Karat pada Sistem atau Komponen Tambahan'],
                ['key' => 'rail_permukaan_berdebu_kimia', 'label' => 'Bebas Permukaan berdebu (kerusakan akibat bahan kimia)'],
                ['key' => 'rail_pengangkut_beroperasi_baik', 'label' => 'Pengangkut sistem beroperasi dengan baik di seluruh sistem'],
                ['key' => 'rail_label_pengujian_teridentifikasi', 'label' => 'Label pengujian dapat dikenali dengan jelas'],
                ['key' => 'rail_label_pabrikan_terbaca', 'label' => 'Label pabrikan jelas dan mudah dibaca'],
                ['key' => 'rail_tanda_ansi_osha_csa', 'label' => 'Tanda ANSI / OSHA / CSA yang Sesuai'],
            ],
        ],
    ],
];

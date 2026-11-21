// Static app data: exercises, plans, muscle maps, pictograms and badge definitions.
import type { IconName } from '@/components/icons';
import type { PlanKey, Unit } from './types';

export interface ExInfo { n: string; m: string; how: string; tip: string }
export const EX: Record<string, ExInfo> = {
  'leg-press': { n: 'Leg Press', m: 'Ön bacak, kalça, arka bacak', how: 'Ayaklar platformda omuz genişliğinde. Dizleri yaklaşık 90°’ye kadar kontrollü bük, topuklardan iterek aç.', tip: 'Dizleri en üstte kilitleme. Bel ve kalça sırtlıktan kalkmasın.' },
  'cs-row': { n: 'Chest-Supported Row', m: 'Sırt (lat, rhomboid), arka omuz', how: 'Göğsünü desteğe yasla, kolları uzat. Dirsekleri geriye çekerek kürek kemiklerini sıkıştır.', tip: 'Göğüs desteği bırakmasın; omuzları kulağa doğru kaldırma.' },
  'chest-press': { n: 'Machine Chest Press', m: 'Göğüs, ön omuz, triceps', how: 'Tutamaklar göğüs hizasında. İterek kolları uzat, yavaşça geri gel.', tip: 'Kürek kemikleri geride ve aşağıda kalsın; dirsekleri tam kilitleme.' },
  'lat-pulldown': { n: 'Lat Pulldown', m: 'Sırt (lat), biceps', how: 'Barı omuzdan biraz geniş tut. Göğsün üstüne doğru çek, kontrollü bırak.', tip: 'Gövdeyi çok geriye atma; barı ensenin arkasına çekme.' },
  'leg-curl': { n: 'Seated Leg Curl', m: 'Arka bacak (hamstring)', how: 'Pedi bileğin hemen üstüne ayarla. Topukları aşağı ve geriye çek, yavaşça geri bırak.', tip: 'Kalça koltuktan kalkmasın; ağırlığı düşürmeden kontrollü dön.' },
  'lateral-raise': { n: 'Dumbbell Lateral Raise', m: 'Yan omuz', how: 'Dambılları yanlardan omuz hizasına kadar kaldır, dirsekler hafif bükük.', tip: 'Hafif ağırlık yeterli; savurma ve omuz silkme yapma.' },
  'biceps-curl': { n: 'Dumbbell Biceps Curl', m: 'Biceps', how: 'Avuçlar önde, dirsekler gövdeye yakın. Dambılları omuza doğru kaldır, yavaşça indir.', tip: 'Dirsekleri öne kaçırma; gövdeyle sallanma.' },
  'dead-bug': { n: 'Dead Bug', m: 'Karın, core stabilitesi', how: 'Sırtüstü, kollar yukarıda, dizler 90°. Karşı kol ve bacağı yavaşça uzat, geri getir, taraf değiştir.', tip: 'Bel yere bastırılı kalsın; hareket yavaş ve nefes kontrollü.' },
  'box-squat': { n: 'Box Squat', m: 'Ön bacak, kalça', how: 'Kutuya/banka doğru kalçayı geriye vererek otur, hafifçe dokun, topuklardan iterek kalk.', tip: 'Kutuya çökme; dizler ayak uçlarıyla aynı yönde.' },
  'cable-row': { n: 'Seated Cable Row', m: 'Sırt, arka omuz, biceps', how: 'Dik otur, tutamağı karnına doğru çek, kürek kemiklerini sıkıştır, kontrollü uzat.', tip: 'Belden sallanma; omuzlar aşağıda kalsın.' },
  'incline-press': { n: 'Incline Chest Press', m: 'Üst göğüs, ön omuz, triceps', how: 'Eğimli makinede tutamakları yukarı-öne doğru it, yavaşça geri gel.', tip: 'Omuzları öne yuvarlama; dirsekleri tam kilitleme.' },
  'glute-bridge': { n: 'Glute Bridge', m: 'Kalça, arka bacak', how: 'Sırtüstü, dizler bükük. Kalçayı sıkarak yukarı kaldır, 1 sn tut, indir.', tip: 'Beli aşırı kavislendirme; itiş topuklardan gelsin.' },
  'face-pull': { n: 'Face Pull', m: 'Arka omuz, üst sırt, rotator cuff', how: 'İp tutamağı yüz hizasında. Yüzüne doğru çek, elleri kulakların yanına aç.', tip: 'Hafif ağırlık; dirsekler yüksek, boyun rahat.' },
  'triceps-pushdown': { n: 'Cable Triceps Pushdown', m: 'Triceps', how: 'Dirsekler gövdeye yakın, tutamağı aşağı it, kolları uzat, kontrollü geri gel.', tip: 'Dirsekleri oynatma; gövdeyle bastırma.' },
  'hammer-curl': { n: 'Hammer Curl', m: 'Biceps, ön kol (brachialis)', how: 'Avuçlar birbirine bakar. Dambılları omza doğru kaldır, yavaşça indir.', tip: 'Dirsekler sabit; sallanma yapma.' },
  'bird-dog': { n: 'Bird Dog', m: 'Core, bel stabilitesi, kalça', how: 'Dört ayak üstünde. Karşı kol ve bacağı uzat, 1–2 sn tut, geri getir.', tip: 'Bel çukurlaşmasın, kalça dönmesin; yavaş hareket et.' },
  'cat-cow': { n: 'Cat–Cow', m: 'Omurga mobilitesi', how: 'Dört ayak üstünde. Nefes alırken beli çukurlaştır, verirken sırtı yuvarla.', tip: 'Acele etme; hareketi nefesle eşleştir.' },
  'chin-tuck': { n: 'Chin Tuck', m: 'Derin boyun kasları, duruş', how: 'Dik dur, çeneyi geriye doğru çekerek “çift çene” yap, 2–3 sn tut.', tip: 'Başı öne eğme; hareket düz geriye doğru.' },
  'wall-slide': { n: 'Wall Slide', m: 'Omuz, üst sırt, duruş', how: 'Sırtın duvarda, kollar “W” şeklinde. Kolları duvara temas ettirerek yukarı kaydır, geri indir.', tip: 'Bel duvardan kopmasın; ağrı yoksa açıklığı artır.' },
  'doorway-stretch': { n: 'Doorway Chest Stretch', m: 'Göğüs, ön omuz (esneme)', how: 'Kolları kapı çerçevesine dayayıp bir adım öne çık, göğüste gerilmeyi hisset.', tip: 'Zorlama yok; omuzlar aşağıda, nefes rahat.' },
};

// Plans live in code: edit these lists to change the program. [id, sets, reps, unit, maxSets]
export type PlanItem = [id: string, sets: number, reps: number, unit?: Unit, max?: number];
export const PLANS: Record<PlanKey, { name: string; home?: boolean; items: PlanItem[] }> = {
  A: { name: 'Full Body A', items: [['leg-press',2,12],['cs-row',2,12],['chest-press',2,12],['lat-pulldown',2,12],['leg-curl',2,12],['lateral-raise',1,15,'',2],['biceps-curl',1,12,'',2],['dead-bug',2,8,'taraf']] },
  B: { name: 'Full Body B', items: [['box-squat',2,10],['cable-row',2,12],['incline-press',2,12],['glute-bridge',2,12],['face-pull',2,15],['triceps-pushdown',1,12,'',2],['hammer-curl',1,12,'',2],['bird-dog',2,8,'taraf']] },
  H: { name: 'Ev Rutini', home: true, items: [['cat-cow',1,10],['chin-tuck',2,8],['wall-slide',2,10],['glute-bridge',2,12],['bird-dog',2,8,'taraf'],['doorway-stretch',2,20,'sn']] },
};

// Muscles per exercise: [primary, secondary], names match the FRONT/BACK polygons below.
export const MU: Record<string, [string, string]> = {
  'leg-press': ['quadriceps gluteal', 'hamstring'], 'cs-row': ['upper_back trapezius', 'back_deltoids biceps'],
  'chest-press': ['chest', 'front_deltoids triceps'], 'lat-pulldown': ['upper_back', 'biceps back_deltoids'],
  'leg-curl': ['hamstring', 'calves'], 'lateral-raise': ['front_deltoids back_deltoids', 'trapezius'],
  'biceps-curl': ['biceps', 'forearm'], 'dead-bug': ['abs', 'obliques'],
  'box-squat': ['quadriceps gluteal', 'hamstring lower_back'], 'cable-row': ['upper_back trapezius', 'biceps back_deltoids lower_back'],
  'incline-press': ['chest', 'front_deltoids triceps'], 'glute-bridge': ['gluteal', 'hamstring lower_back'],
  'face-pull': ['back_deltoids trapezius', 'upper_back'], 'triceps-pushdown': ['triceps', ''],
  'hammer-curl': ['biceps forearm', ''], 'bird-dog': ['lower_back gluteal', 'abs back_deltoids'],
  'cat-cow': ['lower_back abs', 'upper_back'], 'chin-tuck': ['neck', ''],
  'wall-slide': ['trapezius back_deltoids', 'upper_back front_deltoids'], 'doorway-stretch': ['chest', 'front_deltoids'],
};

// Exercises that have photos in public/img (public-domain set: github.com/yuhonas/free-exercise-db)
export const PICS = new Set('leg-press cs-row chest-press lat-pulldown leg-curl lateral-raise biceps-curl dead-bug box-squat cable-row incline-press glute-bridge face-pull triceps-pushdown hammer-curl cat-cow'.split(' '));

// Body outline polygons from react-body-highlighter (MIT, © 2020 GV79)
export const FRONT: Record<string, string[]> = {"chest":["518 416 510 551 580 580 678 555 706 473 620 416","298 465 314 555 408 580 482 551 478 420 376 420"],"obliques":["686 633 673 571 588 596 600 641 604 833 657 788 665 698","339 784 331 718 310 633 322 571 408 592 392 633 392 837"],"abs":["563 592 580 641 584 780 584 927 563 984 551 1041 514 1078 510 845 506 673 510 571","437 588 486 571 490 673 486 845 482 1073 445 1037 408 914 408 784 412 645"],"biceps":["167 682 180 714 229 661 290 539 278 494 204 559","714 494 702 547 763 661 816 718 829 690 788 555"],"triceps":["694 555 694 616 759 727 776 702 755 673","224 694 298 555 298 608 229 731"],"neck":["555 237 506 335 506 392 616 400 706 449 694 367 633 351 584 306","290 449 302 371 363 351 412 302 445 245 490 339 486 392 380 396"],"front_deltoids":["784 531 796 478 792 412 759 380 710 363 722 429 714 473","282 473 212 531 200 478 204 408 245 371 286 371 269 433"],"head":["424 29 400 118 420 196 461 233 498 253 547 224 576 192 592 102 571 24 498 0"],"abductors":["527 1102 543 1249 600 1102 620 1000 649 943 600 927 567 1045","478 1106 449 1253 420 1159 404 1131 396 1073 380 1024 347 939 396 922 416 992 437 1053"],"quadriceps":["347 988 371 1082 371 1278 343 1371 310 1327 294 1200 282 1114 294 1008 322 947","633 1057 645 1000 669 947 702 1012 710 1118 682 1331 653 1376 624 1286 620 1114","388 1294 384 1122 412 1184 445 1294 429 1351 400 1461 363 1465 355 1400","596 1457 555 1290 608 1139 612 1302 641 1396 629 1465","327 1384 265 1457 257 1367 257 1273 269 1143 294 1335","718 1131 739 1241 739 1404 727 1457 665 1384 702 1335"],"knees":["339 1400 347 1433 355 1473 363 1510 351 1567 298 1567 273 1527 273 1473 302 1441","657 1400 722 1478 722 1522 698 1571 649 1567 629 1510"],"calves":["714 1604 735 1535 767 1612 796 1678 784 1878 796 1955 747 1955","249 1947 278 1649 282 1604 261 1543 249 1576 224 1616 208 1678 220 1882 208 1955","727 1951 698 1592 653 1584 641 1624 641 1653 657 1771","355 1584 359 1624 359 1669 351 1722 351 1767 322 1820 306 1873 269 1947 273 1878 282 1804 286 1755 290 1698 298 1641 302 1588"],"forearm":["61 886 102 751 147 702 163 743 192 735 45 976 0 1000","845 698 833 735 800 731 951 984 1000 1004 935 894 898 763","776 722 776 776 804 841 853 898 922 1012 947 996","69 1012 135 906 188 841 216 771 212 718 49 988"]};
export const BACK: Record<string, string[]> = {"head":["506 0 460 9 409 55 404 128 451 200 557 200 591 136 596 47 557 13"],"trapezius":["447 217 477 217 472 383 477 647 383 532 353 409 311 366 391 332 438 272","523 217 557 217 566 272 609 328 689 366 647 404 617 532 523 647 532 383"],"back_deltoids":["294 370 230 391 174 443 183 536 243 494 272 464","711 370 783 396 826 447 817 536 749 489 723 451"],"upper_back":["311 387 281 489 285 553 340 753 472 711 472 664 366 540 336 413","689 387 719 494 715 562 660 753 528 711 528 664 634 545 664 417"],"triceps":["268 498 179 557 145 723 166 817 217 638 268 557","736 502 821 557 860 732 834 821 779 630 732 557","268 583 268 685 230 753 191 774 226 655","728 583 770 647 804 774 766 753 728 689"],"lower_back":["477 728 345 770 353 834 494 1021 468 830","523 728 655 770 647 834 506 1021 532 838"],"forearm":["864 757 911 834 932 940 1000 1064 962 1043 881 894 843 838","136 757 89 838 68 936 0 1064 38 1043 123 885 157 830","813 796 774 779 791 847 911 1038 932 1089 945 1047","187 796 221 779 209 843 94 1030 68 1085 51 1047"],"gluteal":["447 996 302 1085 298 1187 315 1260 472 1213 494 1149","553 991 511 1145 523 1209 681 1260 698 1191 694 1085"],"adductor":["481 1230 447 1230 413 1255 451 1443 485 1357 489 1294","519 1226 557 1234 591 1260 549 1443 519 1362 511 1294"],"hamstring":["289 1221 311 1294 366 1260 353 1353 345 1502 294 1583 289 1468 277 1413 272 1315","715 1217 694 1289 638 1260 655 1366 664 1502 711 1583 715 1477 728 1421 736 1319","387 1255 443 1460 404 1668 362 1528 370 1353","617 1255 634 1362 643 1532 600 1668 562 1464"],"knees":["345 1532 311 1591 336 1664 374 1626","664 1536 630 1630 668 1664 694 1591"],"calves":["294 1604 285 1672 247 1796 238 1928 255 1970 285 1932 298 1800 319 1711 319 1668","374 1651 353 1677 332 1719 311 1804 302 1919 340 2000 387 1906 391 1689","630 1651 613 1685 617 1906 664 1996 706 1919 689 1796 668 1702","706 1604 723 1685 757 1791 766 1928 745 1966 723 1936 706 1796 681 1681"],"left_soleus":["285 1957 302 1957 336 2017 306 2200 285 2136 268 1983"],"right_soleus":["698 1957 719 1957 736 1983 719 2132 702 2196 672 2021"]};

// Pictograms for the exercises without photos: [start, end]; h = head [x, y, r], l = body lines, p = props (floor, wall…)
export interface Fig { h: [number, number, number]; l: string[]; p?: string[] }
export const FIG: Record<string, [Fig, Fig]> = {
  'bird-dog': [
    { h: [93, 33, 5.5], l: ['40,42 80,42 88,37', '80,42 80,68', '40,42 40,68 26,68'], p: ['8,71 112,71'] },
    { h: [93, 33, 5.5], l: ['40,42 80,42 88,37', '80,42 80,68', '80,42 108,36', '40,42 40,68 26,68', '40,42 12,40'], p: ['8,71 112,71'] }],
  'chin-tuck': [
    { h: [66, 28, 11], l: ['40,80 44,64 68,64 72,80', '56,64 61,42', '76,29 81,30'], p: ['56,4 56,12', '56,48 56,58'] },
    { h: [57, 28, 11], l: ['40,80 44,64 68,64 72,80', '56,64 57,42', '67,29 72,30'], p: ['56,4 56,12', '56,48 56,58', '102,29 84,29', '90,24 84,29 90,34'] }],
  'wall-slide': [
    { h: [60, 15, 6], l: ['60,24 60,52', '60,52 52,76', '60,52 68,76', '60,30 46,38 44,22', '60,30 74,38 76,22'], p: ['20,78 100,78'] },
    { h: [60, 15, 6], l: ['60,24 60,52', '60,52 52,76', '60,52 68,76', '60,30 49,24 44,6', '60,30 71,24 76,6'], p: ['20,78 100,78'] }],
  'doorway-stretch': [
    { h: [54, 15, 6], l: ['54,23 54,50', '54,50 50,77', '54,50 58,77', '54,28 66,28 66,14'], p: ['66,3 66,78', '10,78 110,78'] },
    { h: [73, 17, 6], l: ['71,25 68,50', '68,50 78,63 78,77', '68,50 56,77', '71,29 66,27 66,14'], p: ['66,3 66,78', '10,78 110,78'] }],
};

// Badges: [id, name, how to earn, counter, needed, tier, label on the medal] — all derived from history, nothing stored
export type BadgeKind = 'n' | 's' | 'pr' | 'vol' | 'home';
export type Tier = 'b' | 's' | 'g' | 'p' | 'o';
export const BADGES: [id: string, name: string, desc: string, k: BadgeKind, need: number, tier: Tier, label: string][] = [
  ['n1', 'İlk Adım', 'İlk antrenmanını tamamla', 'n', 1, 'b', '1'], ['n5', 'Isındın', '5 antrenman tamamla', 'n', 5, 'b', '5'],
  ['n10', 'Çift Hane', '10 antrenman tamamla', 'n', 10, 's', '10'], ['n25', 'Müdavim', '25 antrenman tamamla', 'n', 25, 'g', '25'],
  ['n50', 'Yarım Yüz', '50 antrenman tamamla', 'n', 50, 'p', '50'], ['n100', 'Yüzler Kulübü', '100 antrenman tamamla', 'n', 100, 'o', '100'],
  ['s2', 'İki Hafta', '2 hafta üst üste haftalık hedefi tuttur', 's', 2, 'b', '2'], ['s4', 'Bir Ay', '4 hafta üst üste hedefi tuttur', 's', 4, 's', '4'],
  ['s8', 'İki Ay', '8 hafta üst üste hedefi tuttur', 's', 8, 'g', '8'], ['s12', 'Çeyrek Yıl', '12 hafta üst üste hedefi tuttur', 's', 12, 'p', '12'],
  ['s26', 'Yarım Yıl', '26 hafta üst üste hedefi tuttur', 's', 26, 'o', '26'],
  ['p1', 'İlk Rekor', 'Bir harekette ağırlık rekoru kır', 'pr', 1, 'b', '1'], ['p10', 'Rekortmen', '10 ağırlık rekoru kır', 'pr', 10, 's', '10'],
  ['p25', 'Rekor Avcısı', '25 ağırlık rekoru kır', 'pr', 25, 'g', '25'],
  ['t10', '10 Ton', 'Toplam 10.000 kg kaldır', 'vol', 10000, 'b', '10T'], ['t100', '100 Ton', 'Toplam 100.000 kg kaldır', 'vol', 100000, 's', '100T'],
  ['t500', '500 Ton', 'Toplam 500.000 kg kaldır', 'vol', 500000, 'g', '500T'],
  ['h5', 'Ev Disiplini', '5 ev rutini tamamla', 'home', 5, 'b', '5'], ['h25', 'Ev Ustası', '25 ev rutini tamamla', 'home', 25, 's', '25'],
];
export const GROUP: Record<BadgeKind, [name: string, icon: IconName]> = { n: ['Antrenman', 'bell'], s: ['Hafta serisi', 'flame'], pr: ['Rekor', 'star'], vol: ['Toplam ağırlık', 'ton'], home: ['Ev rutini', 'home'] };
// Badge colours per tier, lowest to highest: orange, silver, gold, blue, purple. [light, mid, dark] for the gradient.
export const TIER: Record<Tier, [string, string, string]> = {
  b: ['#ffa066', '#ff5a1f', '#e63e00'], s: ['#d9dee6', '#8f99a8', '#5f6878'], g: ['#ffdc73', '#f5a800', '#cc7a00'],
  p: ['#7fc6ff', '#1f8fff', '#0b5fd9'], o: ['#b9a0ff', '#7c5cff', '#5933e0'],
};

export interface SignatureGinBatchSummary {
  batch_id: string;
  recipe: string | null;
  date: string | null;
  still_used: string | null;
  charge_volume_l: number | null;
  charge_abv_percent: number | null;
  hearts_volume_l: number | null;
  hearts_abv_percent: number | null;
  hearts_lal: number | null;
  final_volume_l: number | null;
  final_lal: number | null;
  segments: { label: string; abv_percent: number | null; lal: number | null; }[];
}

export const signatureGinBatchSummaries: SignatureGinBatchSummary[] = [
  {
    "batch_id": "SPIRIT-GIN-SD-0001",
    "recipe": "Signature Dry Gin",
    "date": "2021-01-22",
    "still_used": "Carrie",
    "charge_volume_l": 85,
    "charge_abv_percent": 45.2,
    "hearts_volume_l": 26.5,
    "hearts_abv_percent": 83,
    "hearts_lal": 22,
    "final_volume_l": 52,
    "final_lal": 21.8,
    "segments": [
      {
        "label": "Heads 08:30",
        "abv_percent": 84.4,
        "lal": null
      },
      {
        "label": "Heads 09:00",
        "abv_percent": 84.1,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 09:30",
        "abv_percent": 84.5,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 09:45",
        "abv_percent": 84.5,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 10:45",
        "abv_percent": 84.6,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 11:50",
        "abv_percent": 83.8,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 12:56",
        "abv_percent": 83.5,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 14:20",
        "abv_percent": 83.1,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 15:15",
        "abv_percent": 81.9,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 15:40",
        "abv_percent": 81.1,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 15:55",
        "abv_percent": 80.6,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 16:05",
        "abv_percent": 79.8,
        "lal": null
      },
      {
        "label": "Tails 16:20",
        "abv_percent": 78.1,
        "lal": null
      },
      {
        "label": "Tails 16:25",
        "abv_percent": 77.6,
        "lal": null
      },
      {
        "label": "Tails 16:30",
        "abv_percent": 76.7,
        "lal": null
      }
    ]
  },
  {
    "batch_id": "SPIRIT-GIN-SD-0002",
    "recipe": "Signature Dry Gin",
    "date": "2021-02-04",
    "still_used": "Carrie",
    "charge_volume_l": 85,
    "charge_abv_percent": 45.2,
    "hearts_volume_l": 25,
    "hearts_abv_percent": 83.2,
    "hearts_lal": 20.8,
    "final_volume_l": 50,
    "final_lal": 20.9,
    "segments": [
      {
        "label": "Heads 09:45",
        "abv_percent": 85.5,
        "lal": null
      },
      {
        "label": "Heads 10:00",
        "abv_percent": 84.6,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 10:50",
        "abv_percent": 84.6,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 11:50",
        "abv_percent": 84.3,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 12:50",
        "abv_percent": 84.1,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 13:50",
        "abv_percent": 83.6,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 14:55",
        "abv_percent": 82.8,
        "lal": null
      },
      {
        "label": "Tails 15:05",
        "abv_percent": 82.4,
        "lal": null
      },
      {
        "label": "Tails 15:15",
        "abv_percent": 81.8,
        "lal": null
      },
      {
        "label": "Tails 15:30",
        "abv_percent": 81.2,
        "lal": null
      },
      {
        "label": "Tails 15:45",
        "abv_percent": 78.7,
        "lal": null
      }
    ]
  },
  {
    "batch_id": "SPIRIT-GIN-SD-0003",
    "recipe": "Signature Dry Gin",
    "date": "2021-03-23",
    "still_used": "Carrie",
    "charge_volume_l": 85,
    "charge_abv_percent": 45.2,
    "hearts_volume_l": 24,
    "hearts_abv_percent": 83.2,
    "hearts_lal": 20,
    "final_volume_l": 47,
    "final_lal": 19.6,
    "segments": [
      {
        "label": "Foreshots 08:15",
        "abv_percent": 84.2,
        "lal": null
      },
      {
        "label": "Heads 08:25",
        "abv_percent": 83.3,
        "lal": null
      },
      {
        "label": "Heads 08:30",
        "abv_percent": 83,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 09:20",
        "abv_percent": 83.1,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 10:00",
        "abv_percent": 82.9,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 10:50",
        "abv_percent": 82.6,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 11:40",
        "abv_percent": 82.1,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 12:30",
        "abv_percent": 81.6,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 12:45",
        "abv_percent": 80.4,
        "lal": null
      },
      {
        "label": "Tails 15:05",
        "abv_percent": 74,
        "lal": null
      }
    ]
  },
  {
    "batch_id": "SPIRIT-GIN-SD-0004",
    "recipe": "Signature Dry Gin",
    "date": "2021-04-17",
    "still_used": "Carrie",
    "charge_volume_l": 225,
    "charge_abv_percent": 45.2,
    "hearts_volume_l": 56,
    "hearts_abv_percent": 82.2,
    "hearts_lal": 46,
    "final_volume_l": 107.5,
    "final_lal": 45.2,
    "segments": [
      {
        "label": "Foreshots 10:00",
        "abv_percent": 85,
        "lal": 1.7
      },
      {
        "label": "Heads 10:18",
        "abv_percent": 85.2,
        "lal": 1.3
      },
      {
        "label": "Middle Run (Hearts) 10:34",
        "abv_percent": 84.2,
        "lal": 1.7
      },
      {
        "label": "Middle Run (Hearts) 11:35",
        "abv_percent": 83,
        "lal": 8.3
      },
      {
        "label": "Middle Run (Hearts) 12:27",
        "abv_percent": 82.7,
        "lal": 8.3
      },
      {
        "label": "Middle Run (Hearts) 13:22",
        "abv_percent": 82.3,
        "lal": 8.2
      },
      {
        "label": "Middle Run (Hearts) 14:33",
        "abv_percent": 81.7,
        "lal": 9.8
      },
      {
        "label": "Middle Run (Hearts) 15:11",
        "abv_percent": 81.2,
        "lal": 6.5
      },
      {
        "label": "Middle Run (Hearts) 15:23",
        "abv_percent": 80.9,
        "lal": 1.6
      },
      {
        "label": "Middle Run (Hearts) 15:40",
        "abv_percent": 81,
        "lal": 1.6
      },
      {
        "label": "Tails 15:44",
        "abv_percent": 81,
        "lal": null
      },
      {
        "label": "Tails 16:00",
        "abv_percent": 74,
        "lal": 3.7
      }
    ]
  },
  {
    "batch_id": "SPIRIT-GIN-SD-0005",
    "recipe": "Signature Dry Gin",
    "date": "2021-06-01",
    "still_used": "Carrie",
    "charge_volume_l": 225,
    "charge_abv_percent": 45.2,
    "hearts_volume_l": 55,
    "hearts_abv_percent": 82.4,
    "hearts_lal": 45.3,
    "final_volume_l": 55,
    "final_lal": 0,
    "segments": [
      {
        "label": "Foreshots 09:30",
        "abv_percent": 84.4,
        "lal": 1.3
      },
      {
        "label": "Heads 09:52",
        "abv_percent": 83.3,
        "lal": 1.2
      },
      {
        "label": "Middle Run (Hearts) 10:05",
        "abv_percent": 83.2,
        "lal": 4.2
      },
      {
        "label": "Middle Run (Hearts) 10:33",
        "abv_percent": 83.1,
        "lal": 4.2
      },
      {
        "label": "Middle Run (Hearts) 11:03",
        "abv_percent": 83,
        "lal": 4.2
      },
      {
        "label": "Middle Run (Hearts) 11:32",
        "abv_percent": 82.9,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 12:02",
        "abv_percent": 82.7,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 12:31",
        "abv_percent": 82.5,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 13:03",
        "abv_percent": 82.4,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 13:32",
        "abv_percent": 82.1,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 14:03",
        "abv_percent": 81.9,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 14:34",
        "abv_percent": 81.8,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 14:57",
        "abv_percent": 81.4,
        "lal": 2.8
      },
      {
        "label": "Middle Run (Hearts) 15:10",
        "abv_percent": 81.1,
        "lal": 1.2
      },
      {
        "label": "Tails 15:14",
        "abv_percent": 81,
        "lal": 0.8
      },
      {
        "label": "Tails 15:21",
        "abv_percent": 81,
        "lal": 1.2
      }
    ]
  },
  {
    "batch_id": "SPIRIT-GIN-SD-0006",
    "recipe": "Signature Dry Gin",
    "date": "2021-06-02",
    "still_used": "Carrie",
    "charge_volume_l": 225,
    "charge_abv_percent": 45.2,
    "hearts_volume_l": 55.5,
    "hearts_abv_percent": 82.7,
    "hearts_lal": 45.9,
    "final_volume_l": 226.5,
    "final_lal": 96.3,
    "segments": [
      {
        "label": "Foreshots 08:20",
        "abv_percent": 99,
        "lal": 1.5
      },
      {
        "label": "Heads 08:30",
        "abv_percent": 99,
        "lal": 1.5
      },
      {
        "label": "Middle Run (Hearts) 09:00",
        "abv_percent": 83.4,
        "lal": 4.2
      },
      {
        "label": "Middle Run (Hearts) 09:27",
        "abv_percent": 82.9,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 09:57",
        "abv_percent": 82.9,
        "lal": 4.6
      },
      {
        "label": "Middle Run (Hearts) 10:25",
        "abv_percent": 82.9,
        "lal": 3.7
      },
      {
        "label": "Middle Run (Hearts) 10:55",
        "abv_percent": 83.2,
        "lal": 4.2
      },
      {
        "label": "Middle Run (Hearts) 11:25",
        "abv_percent": 83,
        "lal": 4.2
      },
      {
        "label": "Middle Run (Hearts) 11:55",
        "abv_percent": 82.7,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 12:25",
        "abv_percent": 82.5,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 12:56",
        "abv_percent": 82.4,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 13:25",
        "abv_percent": 82,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 13:44",
        "abv_percent": 81.5,
        "lal": 2.4
      },
      {
        "label": "Middle Run (Hearts) 13:56",
        "abv_percent": 81.6,
        "lal": 2
      }
    ]
  },
  {
    "batch_id": "SPIRIT-GIN-SD-0007",
    "recipe": "Signature Dry Gin",
    "date": "2021-02-02",
    "still_used": "Carrie",
    "charge_volume_l": 225,
    "charge_abv_percent": 45.2,
    "hearts_volume_l": 57,
    "hearts_abv_percent": 82.5,
    "hearts_lal": 47,
    "final_volume_l": 57,
    "final_lal": 0,
    "segments": [
      {
        "label": "Foreshots 10:00",
        "abv_percent": 84.7,
        "lal": 1.3
      },
      {
        "label": "Heads 10:07",
        "abv_percent": 83.5,
        "lal": 1.3
      },
      {
        "label": "Middle Run (Hearts) 10:15",
        "abv_percent": 83.3,
        "lal": 4.2
      },
      {
        "label": "Middle Run (Hearts) 10:41",
        "abv_percent": 83.7,
        "lal": 4.2
      },
      {
        "label": "Middle Run (Hearts) 11:09",
        "abv_percent": 83.1,
        "lal": 4.2
      },
      {
        "label": "Middle Run (Hearts) 11:37",
        "abv_percent": 82.7,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 12:05",
        "abv_percent": 82.7,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 12:32",
        "abv_percent": 82.6,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 13:02",
        "abv_percent": 82.5,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 13:31",
        "abv_percent": 82.2,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 14:03",
        "abv_percent": 82,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 14:37",
        "abv_percent": 81.7,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 15:05",
        "abv_percent": 81.3,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 15:20",
        "abv_percent": 80.4,
        "lal": 1.6
      }
    ]
  },
  {
    "batch_id": "SPIRIT-GIN-SD-0008",
    "recipe": "Signature Dry Gin",
    "date": "2021-07-05",
    "still_used": "Carrie",
    "charge_volume_l": 225,
    "charge_abv_percent": 45.2,
    "hearts_volume_l": 58.5,
    "hearts_abv_percent": 82.4,
    "hearts_lal": 48.2,
    "final_volume_l": 58.5,
    "final_lal": 0,
    "segments": [
      {
        "label": "Foreshots 08:35",
        "abv_percent": 85.2,
        "lal": 1.3
      },
      {
        "label": "Heads 08:43",
        "abv_percent": 83.9,
        "lal": 1.3
      },
      {
        "label": "Middle Run (Hearts) 08:55",
        "abv_percent": 83.4,
        "lal": 1.7
      },
      {
        "label": "Middle Run (Hearts) 09:20",
        "abv_percent": 83.3,
        "lal": 4.2
      },
      {
        "label": "Middle Run (Hearts) 09:39",
        "abv_percent": 83.1,
        "lal": 4.2
      },
      {
        "label": "Middle Run (Hearts) 10:05",
        "abv_percent": 83.1,
        "lal": 4.2
      },
      {
        "label": "Middle Run (Hearts) 10:32",
        "abv_percent": 82.7,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 10:59",
        "abv_percent": 82.7,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 11:28",
        "abv_percent": 82.5,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 11:56",
        "abv_percent": 82.4,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 12:25",
        "abv_percent": 82.1,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 12:54",
        "abv_percent": 81.8,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 13:21",
        "abv_percent": 81.4,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 13:35",
        "abv_percent": 81.2,
        "lal": 2
      },
      {
        "label": "Middle Run (Hearts) 13:45",
        "abv_percent": 81,
        "lal": 1.6
      },
      {
        "label": "Middle Run (Hearts) 13:56",
        "abv_percent": 80.8,
        "lal": 1.6
      },
      {
        "label": "Middle Run (Hearts) 14:08",
        "abv_percent": 80.8,
        "lal": 1.6
      },
      {
        "label": "Tails 14:23",
        "abv_percent": 80.9,
        "lal": 1.6
      }
    ]
  },
  {
    "batch_id": "SPIRIT-GIN-SD-0009",
    "recipe": "Signature Dry Gin",
    "date": "2021-10-13",
    "still_used": "Carrie",
    "charge_volume_l": 225,
    "charge_abv_percent": 45.2,
    "hearts_volume_l": 57.5,
    "hearts_abv_percent": 80.6,
    "hearts_lal": 46.4,
    "final_volume_l": 122,
    "final_lal": 51.6,
    "segments": [
      {
        "label": "Foreshots 09:35",
        "abv_percent": 83,
        "lal": 1.2
      },
      {
        "label": "Heads 09:45",
        "abv_percent": 83,
        "lal": 1.2
      },
      {
        "label": "Middle Run (Hearts) 10:15",
        "abv_percent": 82,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 10:40",
        "abv_percent": 82,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 11:11",
        "abv_percent": 82,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 11:28",
        "abv_percent": 82,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 12:05",
        "abv_percent": 81,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 12:35",
        "abv_percent": 79,
        "lal": 4
      },
      {
        "label": "Middle Run (Hearts) 13:10",
        "abv_percent": 80,
        "lal": 4
      },
      {
        "label": "Middle Run (Hearts) 13:45",
        "abv_percent": 80,
        "lal": 4
      },
      {
        "label": "Middle Run (Hearts) 14:10",
        "abv_percent": 80,
        "lal": 4
      },
      {
        "label": "Middle Run (Hearts) 14:40",
        "abv_percent": 79,
        "lal": 4
      },
      {
        "label": "Middle Run (Hearts) 15:10",
        "abv_percent": 80,
        "lal": 4
      },
      {
        "label": "Middle Run (Hearts) 16:30",
        "abv_percent": 80,
        "lal": 2
      }
    ]
  },
  {
    "batch_id": "SPIRIT-GIN-SD-010",
    "recipe": "Signature Dry Gin",
    "date": "2021-11-12",
    "still_used": "Carrie",
    "charge_volume_l": 750,
    "charge_abv_percent": 45.2,
    "hearts_volume_l": 177,
    "hearts_abv_percent": 81.8,
    "hearts_lal": 144.8,
    "final_volume_l": 177,
    "final_lal": null,
    "segments": [
      {
        "label": "Foreshots",
        "abv_percent": null,
        "lal": 0
      },
      {
        "label": "Heads 08:20",
        "abv_percent": 83.9,
        "lal": 8.4
      },
      {
        "label": "Hearts (column stabilising) 08:40",
        "abv_percent": 83.5,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 09:20",
        "abv_percent": 83.4,
        "lal": 9
      },
      {
        "label": "Middle Run (Hearts) 09:55",
        "abv_percent": 83.1,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 11:15",
        "abv_percent": 82.8,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 11:45",
        "abv_percent": 82.5,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 12:30",
        "abv_percent": 82.5,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 13:15",
        "abv_percent": 82.1,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 13:55",
        "abv_percent": 81.8,
        "lal": 144.8
      }
    ]
  },
  {
    "batch_id": "SPIRIT-GIN-SD-0011",
    "recipe": "Signature Dry Gin",
    "date": "2021-12-17",
    "still_used": "Carrie",
    "charge_volume_l": 250,
    "charge_abv_percent": 45.2,
    "hearts_volume_l": 72,
    "hearts_abv_percent": 82.1,
    "hearts_lal": 59.1,
    "final_volume_l": 142,
    "final_lal": null,
    "segments": [
      {
        "label": "Foreshots 08:18",
        "abv_percent": 86.7,
        "lal": 1.6
      },
      {
        "label": "Heads 08:30",
        "abv_percent": 85.3,
        "lal": 1
      },
      {
        "label": "Middle Run (Hearts) 08:46",
        "abv_percent": 85.1,
        "lal": 1.7
      },
      {
        "label": "Middle Run (Hearts) 09:26",
        "abv_percent": 84.7,
        "lal": 4.2
      },
      {
        "label": "Middle Run (Hearts) 09:48",
        "abv_percent": 83.5,
        "lal": 4.2
      },
      {
        "label": "Middle Run (Hearts) 10:10",
        "abv_percent": 83,
        "lal": 4.2
      },
      {
        "label": "Middle Run (Hearts) 10:30",
        "abv_percent": 82.8,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 10:53",
        "abv_percent": 82.6,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 11:15",
        "abv_percent": 82.5,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 11:34",
        "abv_percent": 82.3,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 11:57",
        "abv_percent": 82.1,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 12:21",
        "abv_percent": 81.9,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 12:45",
        "abv_percent": 81.6,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 13:05",
        "abv_percent": 81.1,
        "lal": 4.1
      },
      {
        "label": "Middle Run (Hearts) 13:28",
        "abv_percent": 80.8,
        "lal": 4
      },
      {
        "label": "Middle Run (Hearts) 13:50",
        "abv_percent": 80.2,
        "lal": 4
      },
      {
        "label": "Middle Run (Hearts) 14:10",
        "abv_percent": 79.6,
        "lal": 4
      },
      {
        "label": "Tails 14:25",
        "abv_percent": 78.9,
        "lal": 1.6
      }
    ]
  },
  {
    "batch_id": "SPIRIT-GIN-SD-012",
    "recipe": "Signature Dry Gin",
    "date": "2022-03-10",
    "still_used": "Carrie",
    "charge_volume_l": 1000,
    "charge_abv_percent": 45.2,
    "hearts_volume_l": 200,
    "hearts_abv_percent": 0,
    "hearts_lal": 0,
    "final_volume_l": 384,
    "final_lal": 162,
    "segments": [
      {
        "label": "Foreshots",
        "abv_percent": 84.7,
        "lal": 1.3
      },
      {
        "label": "Heads",
        "abv_percent": 83.5,
        "lal": 7.1
      },
      {
        "label": "Middle Run (Hearts)",
        "abv_percent": 0,
        "lal": 0
      }
    ]
  },
  {
    "batch_id": "SPIRIT-GIN-SD-013",
    "recipe": "Signature Dry Gin",
    "date": "2022-04-05",
    "still_used": "Carrie",
    "charge_volume_l": 1000,
    "charge_abv_percent": 45.2,
    "hearts_volume_l": 220,
    "hearts_abv_percent": null,
    "hearts_lal": null,
    "final_volume_l": 320,
    "final_lal": null,
    "segments": [
      {
        "label": "Foreshots",
        "abv_percent": null,
        "lal": 0
      },
      {
        "label": "Heads 10:00",
        "abv_percent": null,
        "lal": 0
      }
    ]
  },
  {
    "batch_id": "SPIRIT-GIN-SD-014",
    "recipe": "Signature Dry Gin",
    "date": "2022-06-08",
    "still_used": "Carrie",
    "charge_volume_l": 1000,
    "charge_abv_percent": 45.2,
    "hearts_volume_l": 252,
    "hearts_abv_percent": 79.9,
    "hearts_lal": 201.3,
    "final_volume_l": null,
    "final_lal": null,
    "segments": [
      {
        "label": "Foreshots 08:55",
        "abv_percent": 84.7,
        "lal": 1.7
      },
      {
        "label": "Heads",
        "abv_percent": 83.5,
        "lal": 8.4
      },
      {
        "label": "Middle Run (Hearts) 16:20",
        "abv_percent": 79.9,
        "lal": 201.3
      }
    ]
  },
  {
    "batch_id": "SPIRIT-GIN-SD-015",
    "recipe": "Signature Dry Gin",
    "date": "2022-06-29",
    "still_used": "Carrie",
    "charge_volume_l": 1000,
    "charge_abv_percent": 45.2,
    "hearts_volume_l": 274,
    "hearts_abv_percent": 81.7,
    "hearts_lal": 223.8,
    "final_volume_l": 274,
    "final_lal": null,
    "segments": [
      {
        "label": "Foreshots 08:35",
        "abv_percent": 84.7,
        "lal": 1.7
      },
      {
        "label": "Heads 08:45",
        "abv_percent": 83.5,
        "lal": 8.4
      },
      {
        "label": "Middle Run (Hearts) 16:00",
        "abv_percent": 81.6,
        "lal": 223.8
      }
    ]
  },
  {
    "batch_id": "SPIRIT-GIN-SD-016",
    "recipe": "Signature Dry Gin",
    "date": "2022-11-01",
    "still_used": "Carrie",
    "charge_volume_l": 1000,
    "charge_abv_percent": 50,
    "hearts_volume_l": 266,
    "hearts_abv_percent": 81.1,
    "hearts_lal": 220.1,
    "final_volume_l": null,
    "final_lal": null,
    "segments": [
      {
        "label": "Foreshots 08:45",
        "abv_percent": 82.1,
        "lal": 1.6
      },
      {
        "label": "Heads 08:55",
        "abv_percent": 82.1,
        "lal": 8.2
      },
      {
        "label": "Middle Run (Hearts) 09:25",
        "abv_percent": 82,
        "lal": 17.2
      },
      {
        "label": "Middle Run (Hearts) 15:25",
        "abv_percent": 79.6,
        "lal": 202.8
      }
    ]
  },
  {
    "batch_id": "SPIRIT-GIN-SD-017",
    "recipe": "Signature Dry Gin",
    "date": "2023-08-15",
    "still_used": "Carrie",
    "charge_volume_l": 1000,
    "charge_abv_percent": 48,
    "hearts_volume_l": 282.4,
    "hearts_abv_percent": 80,
    "hearts_lal": 225.9,
    "final_volume_l": null,
    "final_lal": null,
    "segments": [
      {
        "label": "Foreshots 08:40",
        "abv_percent": 85.3,
        "lal": null
      },
      {
        "label": "Heads 08:55",
        "abv_percent": 83.5,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 10:10",
        "abv_percent": 82.9,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 12:10",
        "abv_percent": 81.8,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 13:30",
        "abv_percent": 81.3,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 14:30",
        "abv_percent": 81.2,
        "lal": 190.1
      },
      {
        "label": "Middle Run (Hearts) 15:45",
        "abv_percent": 80,
        "lal": 225.9
      }
    ]
  },
  {
    "batch_id": "SPIRIT-GIN-SD-018",
    "recipe": "Signature Dry Gin",
    "date": "2024-01-31",
    "still_used": "Carrie",
    "charge_volume_l": 1200,
    "charge_abv_percent": 48,
    "hearts_volume_l": 258.0,
    "hearts_abv_percent": 80.6,
    "hearts_lal": 207.9,
    "final_volume_l": 494,
    "final_lal": 209,
    "segments": [
      {
        "label": "Foreshots 08:20",
        "abv_percent": 84,
        "lal": null
      },
      {
        "label": "Heads 08:45",
        "abv_percent": 83.1,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 09:15",
        "abv_percent": 82,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 10:15",
        "abv_percent": 82,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 11:15",
        "abv_percent": 81.5,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 12:15",
        "abv_percent": 80.6,
        "lal": 100.4
      },
      {
        "label": "Middle Run (Hearts) 13:15",
        "abv_percent": 79.9,
        "lal": 133.8
      },
      {
        "label": "Middle Run (Hearts) 14:15",
        "abv_percent": 79.2,
        "lal": 168.2
      },
      {
        "label": "Middle Run (Hearts) 15:20",
        "abv_percent": 80.6,
        "lal": 207.9
      }
    ]
  },
  {
    "batch_id": "SPIRIT-GIN-SD-019",
    "recipe": "Signature Dry Gin New Recipe Trial",
    "date": "2024-10-29",
    "still_used": "Carrie",
    "charge_volume_l": 700,
    "charge_abv_percent": 42.5,
    "hearts_volume_l": 128,
    "hearts_abv_percent": 81.0,
    "hearts_lal": 103.7,
    "final_volume_l": 244,
    "final_lal": 103.2,
    "segments": [
      {
        "label": "Foreshots 08:40",
        "abv_percent": 88,
        "lal": null
      },
      {
        "label": "Heads 08:50",
        "abv_percent": 84.5,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 12:15",
        "abv_percent": 81.1,
        "lal": null
      }
    ]
  },
  {
    "batch_id": "SPIRIT-GIN-SD-0020",
    "recipe": "Signature Dry Gin",
    "date": "2025-04-28",
    "still_used": "Carrie",
    "charge_volume_l": 1000,
    "charge_abv_percent": 42.5,
    "hearts_volume_l": 310,
    "hearts_abv_percent": 81.8,
    "hearts_lal": 253.6,
    "final_volume_l": 603,
    "final_lal": 253.3,
    "segments": [
      {
        "label": "Foreshots 09:00",
        "abv_percent": 88,
        "lal": null
      },
      {
        "label": "Heads 09:20",
        "abv_percent": 84.5,
        "lal": null
      },
      {
        "label": "Middle Run (Hearts) 17:20",
        "abv_percent": 81.8,
        "lal": null
      },
      {
        "label": "Tails 03:30",
        "abv_percent": 80.9,
        "lal": 152.9
      }
    ]
  }
];

export default signatureGinBatchSummaries;

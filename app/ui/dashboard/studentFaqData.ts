export type StudentFaqSection = {
  id: string;
  title: string;
  description: string;
  items: Array<{
    question: string;
    answer: string[];
    tags?: string[];
    contactLink?: {
      label: string;
      href: string;
    };
  }>;
};

export const studentFaqSections: StudentFaqSection[] = [
  {
    id: 'how-to-borrow',
    title: 'How to Borrow a Book',
    description: 'A step-by-step walkthrough of the self-checkout process from start to finish.',
    items: [
      {
        question: 'Step 1 — Find the book you want to borrow',
        answer: [
          'Go to Borrow Books from the side navigation or bottom menu.',
          'You have two ways to find a title:',
          '• Search by title, author, or ISBN — type in the search box and select the correct item from the results.',
          '• Scan the barcode — tap the camera icon to open the barcode scanner and point it at the barcode on the back cover of the book. The system will identify the title automatically.',
          'Important: You must have your Swinburne ID card to borrow.',
        ],
        tags: ['Search', 'Barcode', 'Scanner'],
      },
      {
        question: 'Step 2 — Confirm the loan details',
        answer: [
          'Once the book is found, the system will display the title, copy details, and your due date.',
          'Students may borrow up to 10 General Collection items for 14 days from today.',
          'Check that the correct copy is selected — if a specific copy is already on loan, the system will let you know and suggest an available one.',
        ],
        tags: ['Due date', 'Loan period', '14 days'],
      },
      {
        question: 'Step 3 — Complete the checkout',
        answer: [
          'Tap "Borrow" to confirm. The loan is recorded instantly and will appear under your Active Loans on the dashboard.',
          'Ensure all books are checked out at the self-check machine before removing them from the bookshelves area — this prevents triggering the RFID alarm. This applies to all use, including in-house reference.',
          'You will receive a notification reminder as your due date approaches.',
        ],
        tags: ['Checkout', 'Active loans', 'RFID'],
      },
    ],
  },
  {
    id: 'loan-periods',
    title: 'Loan Periods & Borrowing Limits',
    description: 'How long you can keep items and how many you can borrow, by material type.',
    items: [
      {
        question: 'General Collection — how long can students borrow?',
        answer: [
          'Students: up to 10 items for 14 days, with a 7-day renewal period.',
          'Postgraduates: up to 20 items for 30 days, with a 30-day renewal.',
          'Non-Academic Staff: up to 10 items for 30 days, with a 30-day renewal.',
          'Academic Staff: up to 50 items for 60 days, with a 60-day renewal.',
        ],
        tags: ['General collection', 'Loan period', 'Limits'],
      },
      {
        question: 'Staff Collection — what are the loan rules for students?',
        answer: [
          'Students may only borrow Staff Collection items on an overnight loan.',
          'There is no renewal option for students on Staff Collection items.',
          'The fine for overdue overnight loans is RM1.00 per hour.',
        ],
        tags: ['Staff collection', 'Overnight loan'],
      },
      {
        question: 'Reference materials and periodicals',
        answer: [
          'Reference items: 3-day loan for all patron types, no renewal, fine of RM0.50 per day.',
          'Periodicals and Newspapers: non-circulating — these items are not available for loan and must be used in the library.',
        ],
        tags: ['Reference', 'Periodicals', 'Newspapers'],
      },
    ],
  },
  {
    id: 'due-dates',
    title: 'Due Dates & Renewals',
    description: 'How to check your due dates, renew items, and what happens when items are overdue.',
    items: [
      {
        question: 'Where can I see my due dates?',
        answer: [
          'Open the Dashboard — your active loans are listed with the title, borrow date, and due date for each item.',
          'You can also check the Notifications page for upcoming due date reminders sent by the system.',
        ],
        tags: ['Dashboard', 'Active loans', 'Notifications'],
        contactLink: {
          label: 'View dashboard',
          href: '/dashboard',
        },
      },
      {
        question: 'How do I renew my loan?',
        answer: [
          'Online: Log in to My Account on the dashboard and tap "Renew" next to the item.',
          'Mobile app: Download the "Swinburne Sarawak Library" app from the App Store or Google Play by searching for "Swinburne Sarawak Library".',
          'In person at library counters, by phone during opening hours (+6082 260 936), or by email to library@swinburne.edu.my.',
          'Students get a 7-day renewal for General Collection items. You can renew any time before the item is due.',
          'You cannot renew if you have overdue loans, unpaid fines, someone has placed a hold on the item, or your library membership has expired.',
        ],
        tags: ['Renewal', 'Mobile app', 'Extension'],
      },
      {
        question: 'What happens if I return the book late?',
        answer: [
          'Fines for General Collection and Reference items: RM0.50 per day.',
          'Fines for overnight Staff Collection loans (students): RM1.00 per hour.',
          'Return the book as soon as possible to the library counters. Overdue items may affect your ability to borrow further titles until resolved.',
        ],
        tags: ['Overdue', 'Fine', 'Late return'],
        contactLink: {
          label: 'Email library@swinburne.edu.my',
          href: 'mailto:library@swinburne.edu.my',
        },
      },
      {
        question: 'How do I avoid fines?',
        answer: [
          'Renew items on or before the due date — online via My Account, the Swinburne Sarawak Library mobile app, in person, by phone, or by email.',
          'Check your account regularly to stay on top of due dates.',
          'Never lend your student ID card or borrow on someone else\'s behalf. All fees associated with items borrowed on your account are your responsibility.',
          'Report lost ID cards to the library immediately.',
        ],
        tags: ['Fines', 'Tips', 'Renewal'],
      },
    ],
  },
  {
    id: 'returning',
    title: 'Returning Books',
    description: 'How to return a book and make sure the record is updated correctly.',
    items: [
      {
        question: 'How do I return a book?',
        answer: [
          'Bring the physical book to the library counters.',
          'A staff member will process the return in the system. You can verify this by checking your Active Loans — the item should disappear once the return is processed.',
          'If you returned the book but it still shows as active, wait a few minutes and refresh the page.',
        ],
        tags: ['Return', 'Library counter'],
      },
      {
        question: 'The book I returned is still showing as active. What should I do?',
        answer: [
          'Returns are processed by staff. If the return was not scanned properly, the item will remain on your record.',
          'Contact the library service desk with your student ID and the title to have the record corrected.',
        ],
        tags: ['Return', 'Active loans'],
        contactLink: {
          label: 'Email library@swinburne.edu.my',
          href: 'mailto:library@swinburne.edu.my',
        },
      },
    ],
  },
  {
    id: 'payments-lost',
    title: 'Fines, Payments & Lost Items',
    description: 'How to pay library fines and what to do if an item is lost or damaged.',
    items: [
      {
        question: 'How do I pay library fines?',
        answer: [
          'At the library counter — pay via e-wallet by scanning the QR code available at the counter.',
          'By email — send a message to library@swinburne.edu.my and the library will provide a QR code for payment.',
        ],
        tags: ['Payment', 'Fines', 'e-wallet'],
        contactLink: {
          label: 'Email library@swinburne.edu.my',
          href: 'mailto:library@swinburne.edu.my',
        },
      },
      {
        question: 'What happens if I lose or damage a book?',
        answer: [
          'You are required to pay a replacement cost plus an administration fee of RM50.00.',
          'The replacement cost is the current price if the item is still in print, or the average price for the subject area if it is no longer available.',
          'You can replace the item with a new copy or a new edition of the book.',
          'You cannot borrow or renew until outstanding charges are paid or the item is replaced.',
          'Failure to settle may result in suspension of borrowing privileges and withholding of testamur.',
        ],
        tags: ['Lost', 'Damaged', 'Replacement', 'RM50'],
        contactLink: {
          label: 'Email library@swinburne.edu.my',
          href: 'mailto:library@swinburne.edu.my',
        },
      },
    ],
  },
  {
    id: 'scanner',
    title: 'Using the Barcode Scanner',
    description: 'Tips for scanning book barcodes reliably using the camera on your device.',
    items: [
      {
        question: 'How do I use the camera scanner to borrow a book?',
        answer: [
          'On the Borrow Books page, tap the camera icon or go to the Camera Scan page from the bottom navigation.',
          'Point your device camera at the barcode on the back cover of the book. Hold it steady and make sure the barcode is within the frame.',
          'The scanner will detect the barcode automatically. Once found, the book details will load and you can proceed with checkout.',
        ],
        tags: ['Scanner', 'Camera'],
        contactLink: {
          label: 'Open camera scan',
          href: '/dashboard/cameraScan',
        },
      },
      {
        question: 'The scanner is not detecting the barcode. What should I try?',
        answer: [
          'Ensure the barcode is clean and not torn or obscured.',
          'Try better lighting — move closer to a light source or enable your device torch if available.',
          'Hold the camera 10–15 cm away from the barcode rather than too close.',
          'If the scanner still fails, use the search box to look up the title by name or ISBN instead.',
        ],
        tags: ['Scanner', 'Troubleshooting'],
      },
    ],
  },
  {
    id: 'account',
    title: 'Your Account & Notifications',
    description: 'Managing your profile, contact details, and staying on top of reminders.',
    items: [
      {
        question: 'How do I sign in to the dashboard?',
        answer: [
          'Sign in using your Swinburne Microsoft account (your student email ending in @student.swinburne.edu.my).',
          'Personal email accounts are not supported. If you are redirected in a loop, clear your browser cookies and try again.',
        ],
        tags: ['Login', 'Microsoft'],
        contactLink: {
          label: 'Open help desk portal',
          href: 'https://helpdesk.swinburne.edu.my/',
        },
      },
      {
        question: 'How do I update my contact details?',
        answer: [
          'Go to My Profile from the side navigation or the quick navigation panel.',
          'Edit your email or phone number under "Contact & details" and save the changes.',
          'Keeping your contact details up to date ensures you receive due date reminders and important notices.',
        ],
        tags: ['Profile', 'Contact'],
        contactLink: {
          label: 'Open My Profile',
          href: '/dashboard/profile',
        },
      },
      {
        question: 'Why am I receiving overdue reminders?',
        answer: [
          'The system sends reminders when a borrowed item is approaching or has passed its due date.',
          'Check your Active Loans on the dashboard. If the item shows as still on loan but you have returned it, the return may not have been recorded correctly.',
          'Contact the library service desk with your student ID to have the record corrected.',
        ],
        tags: ['Notifications', 'Overdue'],
        contactLink: {
          label: 'Email library@swinburne.edu.my',
          href: 'mailto:library@swinburne.edu.my',
        },
      },
    ],
  },
];

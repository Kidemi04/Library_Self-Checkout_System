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
        ],
        tags: ['Search', 'Barcode', 'Scanner'],
      },
      {
        question: 'Step 2 — Confirm the loan details',
        answer: [
          'Once the book is found, the system will display the title, copy details, and your due date.',
          'The default loan period is 14 days from today. Your due date is calculated and shown before you confirm.',
          'Check that the correct copy is selected — if a specific copy is already on loan, the system will let you know and suggest an available one.',
        ],
        tags: ['Due date', 'Loan period'],
      },
      {
        question: 'Step 3 — Complete the checkout',
        answer: [
          'Tap "Borrow" to confirm. The loan is recorded instantly and will appear under your Active Loans on the dashboard.',
          'No library staff or physical stamp is needed — the self-checkout handles everything.',
          'You will receive a notification reminder as your due date approaches.',
        ],
        tags: ['Checkout', 'Active loans'],
      },
    ],
  },
  {
    id: 'due-dates',
    title: 'Loan Period & Due Dates',
    description: 'Understanding how long you can keep a book and what happens when it is due.',
    items: [
      {
        question: 'How long can I keep a borrowed book?',
        answer: [
          'The standard loan period is 14 days from the date you borrow the book.',
          'Your exact due date is shown at checkout and is also listed on the Active Loans section of your dashboard at any time.',
        ],
        tags: ['14 days', 'Loan period'],
      },
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
        question: 'Can I renew my loan before it is due?',
        answer: [
          'Yes. Open your Active Loans from the dashboard and select the book you want to renew.',
          'If the renewal option is available, tap "Renew" to extend the loan by another 14 days.',
          'Renewal may not be available if another student has placed a hold on the same title.',
        ],
        tags: ['Renewal', 'Extension'],
      },
      {
        question: 'What happens if I return the book late?',
        answer: [
          'Overdue items are flagged in the system and the library staff may contact you.',
          'Return the book as soon as possible to the library service desk and ensure the return is recorded in the system.',
          'Persistent overdue items may affect your ability to borrow further titles until resolved.',
        ],
        tags: ['Overdue', 'Late return'],
        contactLink: {
          label: 'Email library@swinburne.edu.my',
          href: 'mailto:library@swinburne.edu.my',
        },
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
          'Bring the physical book back to the library service desk on Level 1.',
          'A staff member will scan the book to mark it as returned in the system. You can verify this by checking your Active Loans — the item should disappear once the return is processed.',
          'If you returned the book but it still shows as active, wait a few minutes and refresh the page.',
        ],
        tags: ['Return', 'Service desk'],
      },
      {
        question: 'The book I returned is still showing as active. What should I do?',
        answer: [
          'Returns are processed by staff using the Check-In flow. If the return was not scanned properly, the item will remain on your record.',
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
          'Contact the service desk with your student ID to have the record corrected.',
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

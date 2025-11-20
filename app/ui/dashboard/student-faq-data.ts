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
    id: 'borrowing',
    title: 'Borrowing Basics',
    description: 'Everything you need to know before checking out a title from the self-service page.',
    items: [
      {
        question: 'How do I start a new self-checkout?',
        answer: [
          'Open the Borrow Books view from the dashboard and scan the barcode on the back cover. You can also search by title, author, or ISBN to locate the record first.',
          'Confirm the borrower ID, ensure the due date looks correct, and click “Borrow book”. The loan is recorded instantly.',
        ],
        tags: ['Borrow books', 'Scanning'],
      },
      {
        question: 'Can I borrow more than one book at a time?',
        answer: [
          'Yes. Scan each title one after another. Every successful scan adds the item to the basket with the same due date.',
          'Students can keep up to 5 items simultaneously unless a hold or fine blocks the account.',
        ],
        tags: ['Borrow limit'],
      },
    ],
  },
  {
    id: 'returns',
    title: 'Returns & renewals',
    description: 'Guidance for extending loans or finishing them when you bring a book back.',
    items: [
      {
        question: 'Where do I record a return?',
        answer: [
          'Use the Returning Books page. Scan the borrower ID or the title’s barcode and confirm the return action.',
          'Returned titles appear in the Active loans table until the status updates. Refresh the page if you want to see the change immediately.',
        ],
        tags: ['Returns'],
      },
      {
        question: 'How do I renew my book?',
        answer: [
          'Open the dashboard overview and locate the Active loans card. Select the title you want to renew.',
          'If renewals are available, you will see a “Renew” button. Items on hold for another student cannot be renewed.',
        ],
        tags: ['Renewal'],
      },
    ],
  },
  {
    id: 'accounts',
    title: 'Account & notifications',
    description: 'Keep your contact info updated so reminders reach you in time.',
    items: [
      {
        question: 'How do I update my email or phone number?',
        answer: [
          'Navigate to My Profile from the side navigation.',
          'Edit the fields under “Contact & details” and press “Save changes”.',
        ],
        tags: ['Profile'],
        contactLink: {
          label: 'Open My Profile',
          href: '/dashboard/profile',
        },
      },
      {
        question: 'Why am I still receiving overdue reminders?',
        answer: [
          'Reminders are sent when an item is overdue or has not been returned in the system.',
          'Verify the item was scanned in Returning Books. If the issue persists, contact the service desk so we can update the record for you.',
        ],
        tags: ['Notifications'],
        contactLink: {
          label: 'Email library@swinburne.edu.my',
          href: 'mailto:library@swinburne.edu.my',
        },
      },
    ],
  },
  {
    id: 'technical',
    title: 'Technical issues',
    description: 'Quick troubleshooting steps for students using the self-checkout dashboard.',
    items: [
      {
        question: 'The scanner is not picking up the barcode. What should I do?',
        answer: [
          'Make sure the code is well lit, clean, and within the camera frame.',
          'If the issue continues, type the barcode manually or switch to “Scan from photo”.',
        ],
        tags: ['Scanner'],
      },
      {
        question: 'I cannot sign in to the dashboard.',
        answer: [
          'Ensure you are using your Swinburne Microsoft account. Personal accounts are not supported.',
          'If the login loop persists, clear your browser cache and try again or contact the library IT support line.',
        ],
        contactLink: {
          label: 'Open help desk portal',
          href: 'https://helpdesk.swinburne.edu/',
        },
      },
    ],
  },
];

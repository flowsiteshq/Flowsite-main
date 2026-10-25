# FlowSites AI Video Studio production workflow

FlowSites Video Studio is a managed production service, not an automated customer-facing video generator. A customer selects a package, submits a brief and optional brand materials, and completes secure payment. The order enters the internal Video Studio queue only after Stripe confirms payment.

## Internal production path

1. **Brief review:** A FlowSites producer verifies the requested objective, audience, aspect ratio, required brand assets, and call to action. If the brief needs clarification, the order remains in the paid queue while the team follows up.
2. **Creative production:** Where available, the production team uses Manus 2.0 Video Editor and Alchemy mode to develop concepts, create shots, assemble edits, and prepare an approval cut. The tools support the team; they do not automatically generate or deliver a customer video from the public website.
3. **Review and revisions:** The producer posts a secure preview URL in the admin queue, marks the order as `review`, and records customer feedback as revision notes. The package selected at checkout determines the included review rounds shown on the order page.
4. **Delivery:** After approval, the producer posts the final delivery URL, marks the order `delivered`, and preserves the brief, uploaded assets, review link, revision history, and final link together in the queue.

## Order status meanings

| Status | Meaning |
|---|---|
| Pending payment | The brief exists, but production cannot begin. |
| Paid | Stripe confirmed payment; ready for an internal producer to accept. |
| In production | Creative work is underway. |
| Review | An approval-ready cut is available. |
| Revision requested | Feedback has been received and is being addressed. |
| Delivered | The approved final file has been provided. |
| Cancelled | The order will not proceed. |

The three public gallery clips are **original FlowSites demonstration concepts**. They are deliberately labeled as demonstrations and are not represented as client projects, testimonials, or campaign outcomes.

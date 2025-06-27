    import dbConnect from '@/lib/mongodb';
    import SpecialOffer from '@/models/SpecialOffer';

    export default async function handler(req, res) {
    await dbConnect();

    const { id } = req.query;

    if (req.method === 'PUT') {
        try {
        const updatedOffer = await SpecialOffer.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        if (!updatedOffer) return res.status(404).json({ success: false, error: 'Offer not found' });

        res.status(200).json({ success: true, data: updatedOffer });
        } catch (error) {
        res.status(500).json({ success: false, error: error.message });
        }
    }

    else if (req.method === 'DELETE') {
        try {
        const deleted = await SpecialOffer.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ success: false, error: 'Offer not found' });

        res.status(200).json({ success: true, message: 'Offer deleted' });
        } catch (error) {
        res.status(500).json({ success: false, error: error.message });
        }
    }

    else {
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    }

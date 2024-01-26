const { AppointmentService } = require('../services/AppointmentService');
const { Appointment } = require('../models/Appointment');
const { HttpResponse } = require('../../system/helpers/HttpResponse');
const mongoose = require('mongoose');
const appointmentService = new AppointmentService(new Appointment().getInstance());
const { PatientsService } = require('./../services/PatientsService');
const { Patients } = require('./../models/Patients');
const patientsService = new PatientsService(new Patients().getInstance());
const moment = require('moment')

class AppointmentController {
    async add(req, res, next) {
        try {
            const appointmentObj = await appointmentService.insert(req.body);
            await res.status(200).json(appointmentObj);
        } catch (e) {
            next(e);
        }
    }


    async update(req, res, next) {
        try {
            let { appointmentId, problem, prescription, attachments, followUp, status } = req.body;
            let update = {}
            if (problem) update['problem'] = problem;
            if (prescription) update['prescription'] = prescription;
            if (attachments) update['attachments'] = attachments;
            if (followUp) update['followUp'] = followUp;
            if (status) update['status'] = status;

            const updatedObj = await appointmentService.model.findByIdAndUpdate(appointmentId, update, { 'new': true });

            await res.status(200).json(updatedObj);
        } catch (errors) {
            throw errors;
        }
    }

    async get(req, res, next) {
        const { id } = req.params;

        try {

            let items = await appointmentService.model.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(id) } },
                {
                    $lookup: {
                        from: 'patients',
                        let: { patient: "$patient" },
                        pipeline: [
                            { $match: { $expr: { $and: [{ $eq: ['$_id', "$$patient"] }] } } },
                            { $project: { name: 1, mobileNo: 1, gender: 1, age: 1 } }
                        ],
                        as: 'patientInfo'
                    }
                },
                { $unwind: { path: '$patientInfo', preserveNullAndEmptyArrays: true } },
            ])

            return res.status(200).json(items?.length ? items[0] : {});
        } catch (e) {
            next(e);
        }
    }

    async getAll(req, res, next) {
        let { currentPage, limit, search, status } = req.body;
        let skip = currentPage == 1 ? 0 : (currentPage - 1) * limit;

        limit = limit ? Number(limit) : 10;
        try {
            let query = { isDeleted: { $ne: true } }
            if (search) {
                let patientsIds = await patientsService.model.distinct('_id', { isDeleted: { $ne: true }, $or: [{ name: { $regex: search, $options: 'i' } }, { mobileNo: { $regex: search, $options: 'i' } }] });
                query['$or'] = [{ problem: { $regex: search, $options: 'i' } }, { prescription: { $regex: search, $options: 'i' } }, { patient: { $in: patientsIds } }]
            }
            if (status) query['status'] = status;

            let items = await appointmentService.model.aggregate([
                { $match: query },
                { $sort: { 'createdAt': -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: 'patients',
                        let: { patient: "$patient" },
                        pipeline: [
                            { $match: { $expr: { $and: [{ $eq: ['$_id', "$$patient"] }] } } },
                            { $project: { name: 1, mobileNo: 1, gender: 1, age: 1 } }
                        ],
                        as: 'patientInfo'
                    }
                },
                { $unwind: { path: '$patientInfo', preserveNullAndEmptyArrays: true } },
            ])

            const total = await appointmentService.model.countDocuments(query);
            const response = new HttpResponse(items, { 'totalCount': total });

            return res.status(response.statusCode).json(response);
        } catch (e) {
            next(e);
        }
    }

    async dashboard(req, res, next) {
        let { currentPage, limit, search, type, status } = req.body;
        let skip = currentPage == 1 ? 0 : (currentPage - 1) * limit;

        limit = limit ? Number(limit) : 10;
        try {
            let query = { isDeleted: { $ne: true } }
            if (search) {
                let patientsIds = await patientsService.model.distinct('_id', { isDeleted: { $ne: true }, $or: [{ name: { $regex: search, $options: 'i' } }, { mobileNo: { $regex: search, $options: 'i' } }] });
                query['$or'] = [{ problem: { $regex: search, $options: 'i' } }, { prescription: { $regex: search, $options: 'i' } }, { patient: { $in: patientsIds } }]
            }
            if (status) query['status'] = status;

            if (type) {
                switch (type) {
                    case 'past':
                        query['followUp'] = { $lt: new Date(moment().clone().startOf('day')) }
                        break;
                    case 'today':
                        query['followUp'] = { $gte: new Date(moment().clone().startOf('day')), $lt: new Date(moment().clone().endOf('day')) }
                        break;
                    case 'upcoming':
                        query['followUp'] = { $gt: new Date(moment().clone().endOf('day')) }
                        break;
                    default:
                        break;
                }
            }

            let items = await appointmentService.model.aggregate([
                { $match: query },
                { $sort: { 'createdAt': -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: 'patients',
                        let: { patient: "$patient" },
                        pipeline: [
                            { $match: { $expr: { $and: [{ $eq: ['$_id', "$$patient"] }] } } },
                            { $project: { name: 1, mobileNo: 1, gender: 1, age: 1 } }
                        ],
                        as: 'patientInfo'
                    }
                },
                { $unwind: { path: '$patientInfo', preserveNullAndEmptyArrays: true } },
            ])

            const total = await appointmentService.model.countDocuments(query);
            const response = new HttpResponse(items, { 'totalCount': total });

            return res.status(response.statusCode).json(response);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new AppointmentController(appointmentService);

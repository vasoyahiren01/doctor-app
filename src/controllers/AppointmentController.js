const { AppointmentService } = require('../services/AppointmentService');
const { Appointment } = require('../models/Appointment');
const { HttpResponse } = require('../../system/helpers/HttpResponse');
const mongoose = require('mongoose');
const appointmentService = new AppointmentService(new Appointment().getInstance());
const { PatientsService } = require('./../services/PatientsService');
const { Patients } = require('./../models/Patients');
const patientsService = new PatientsService(new Patients().getInstance());
const moment = require('moment')
const { Files } = require( './../models/Files' );
const { FilesService } = require( './../services/FilesService' );
const filesService = new FilesService(
    new Files().getInstance()
);
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
            let { appointmentId, problem, prescription, attachments, followUp, status, procudure } = req.body;
            let update = {}
            if (problem) update['problem'] = problem;
            if (prescription) update['prescription'] = prescription;
            if (attachments) update['attachments'] = attachments;
            if (followUp) update['followUp'] = followUp;
            if (status) update['status'] = status;
            update['procudure'] = procudure || false;

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
                            { $project: { name: 1, mobileNo: 1, gender: 1, age: 1} }
                        ],
                        as: 'patientInfo'
                    }
                },
                { $unwind: { path: '$patientInfo', preserveNullAndEmptyArrays: true } },
            ])

            if (items.length) {
                let imageIds = [];
                items.map(e => {
                    if (e?.attachments?.length) {
                        imageIds = [...imageIds, ...e?.attachments]
                    }
                })

                let appointments = await filesService.model.find({ _id: { $in: imageIds } });

                for (let i = 0; i < items.length; i++) {
                    let attechFile = items[i]?.attachments || [];
                    attechFile = JSON.parse(JSON.stringify(attechFile));
                    if (attechFile?.length) {
                        items[i].attachments = appointments.filter(e => attechFile.includes(e._id?.toString()))
                    }
                }
            }



            return res.status(200).json(items?.length ? items[0] : {});
        } catch (e) {
            next(e);
        }
    }

    async getAll(req, res, next) {
        let { currentPage, limit, search, status, patient, procudure = false } = req.body;
        let skip = currentPage == 1 ? 0 : (currentPage - 1) * limit;

        limit = limit ? Number(limit) : 10;
        try {
            let query = { isDeleted: { $ne: true } };
            let sort = { 'createdAt': -1 }
            if (search) {
                let patientsIds = await patientsService.model.distinct('_id', { isDeleted: { $ne: true }, $or: [{ name: { $regex: search, $options: 'i' } }, { mobileNo: { $regex: search, $options: 'i' } }] });
                query['$or'] = [{ problem: { $regex: search, $options: 'i' } }, { prescription: { $regex: search, $options: 'i' } }, { patient: { $in: patientsIds } }]
            }
            if (status) query['status'] = status;

            if(patient) query['patient'] = new mongoose.Types.ObjectId(patient);

            if(procudure) {
                query['procudure'] = true;
                query['followUp'] = { $gte: convertTime({ date: moment().clone().startOf('day').toDate() }) };
                sort = { 'followUp': 1 }
            }

            let items = await appointmentService.model.aggregate([
                { $match: query },
                { $sort: sort },
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

            if (items.length) {
                let imageIds = [];
                items.map(e => {
                    if (e?.attachments?.length) {
                        imageIds = [...imageIds, ...e?.attachments]
                    }
                })

                let appointments = await filesService.model.find({ _id: { $in: imageIds } });

                for (let i = 0; i < items.length; i++) {
                    let attechFile = items[i]?.attachments || [];
                    attechFile = JSON.parse(JSON.stringify(attechFile));
                    if (attechFile?.length) {
                        items[i].attachments = appointments.filter(e => attechFile.includes(e._id?.toString()))
                    }
                }
            }

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
                        query['followUp'] = { $lt: convertTime({ date: moment().clone().startOf('day').toDate()})}
                        break;
                    case 'today':
                        query['followUp'] = { $gte: convertTime({ date: moment().clone().startOf('day').toDate()}), $lt: convertTime({ date: moment().clone().endOf('day').toDate()}) }
                        break;
                    case 'upcoming':
                        query['followUp'] = { $gt: convertTime({ date: moment().clone().endOf('day').toDate()}) }
                        break;
                    default:
                        break;
                }
            }

            let items = await appointmentService.model.aggregate([
                { $match: query },
                { $sort: { 'followUp': type == 'past' ? -1 : 1 } },
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


function convertTime({ date = new Date(), from = -330, to = 0 }) {
    let currentDate = new Date(date),
        convertTimezoneOffset = to;

    /**
     * get utc time
     */
    let utc = currentDate.getTime() + from * 60 * 1000;

    return new Date(utc - convertTimezoneOffset * 60 * 1000);
}


module.exports = new AppointmentController(appointmentService);

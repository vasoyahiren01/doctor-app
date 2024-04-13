const { PatientsService } = require('./../services/PatientsService');
const { Patients } = require('./../models/Patients');
const { HttpResponse } = require('../../system/helpers/HttpResponse');
const { AppointmentService } = require('../services/AppointmentService');
const { Appointment } = require('../models/Appointment');
const { HttpError } = require('../../system/helpers/HttpError');
const appointmentService = new AppointmentService(new Appointment().getInstance());
const patientsService = new PatientsService(new Patients().getInstance());

class PatientsController {

    async insert(req, res, next) {
        try {
            let { mobileNo } = req.body;

            let patient = await patientsService.model.findOne({ mobileNo });
            if (patient) {
                const error = new Error('Patient already exists');
                error.statusCode = 422;
                return res.status(error.statusCode).json(new HttpError(error));
            }
            const registeredUserData = await patientsService.insert(req.body);
            await res.status(200).json(registeredUserData);
        } catch (e) {
            next(e);
        }
    }

    async get(req, res, next) {
        const { id } = req.params;

        try {
            let response = await patientsService.get(id);
            response['appointments'] = await appointmentService.model.find({ patient: id }).sort({ 'createdAt': -1 });
            return res.status(response.statusCode).json(response);
        } catch (e) {
            next(e);
        }
    }

    async getAll(req, res, next) {
        let { currentPage, limit, search } = req.body;
        let skip = currentPage == 1 ? 0 : (currentPage - 1) * limit;

        limit = limit ? Number(limit) : 10;
        try {
            let query = { isDeleted: { $ne: true } }
            if (search) {
                query['$or'] = [{ name: { $regex: search, $options: 'i' } }, { mobileNo: { $regex: search, $options: 'i' } }]
            }
            const items = await patientsService.model.find(query).sort({ 'createdAt': -1 }).skip(skip).limit(limit);
            const total = await patientsService.model.countDocuments(query);
            const response = new HttpResponse(items, { 'totalCount': total });

            return res.status(response.statusCode).json(response);
        } catch (e) {
            next(e);
        }
    }

    async delete(req, res, next) {
        let { id } = req.body;
        try {
            let response = await patientsService.delete(id);
            await appointmentService.model.deleteMany({ patient: id });
            return res.status(response.statusCode).json(response);
        } catch (e) {
            next(e);
        }
    }

}

module.exports = new PatientsController(patientsService);

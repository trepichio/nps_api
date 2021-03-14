import { Request, Response } from "express";
import { resolve } from "path";
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/AppError";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveysUsersRepository } from "../repositories/SurveysUserRepository";
import { UsersRepository } from "../repositories/UsersRepository";
import SendMailService from "../services/SendMailService";

class SendMailController {
  async execute(request: Request, response: Response) {
    const { email, survey_id } = request.body;

    const userRepository = getCustomRepository(UsersRepository);
    const surveyRepository = getCustomRepository(SurveysRepository);
    const surveyUserRepository = getCustomRepository(SurveysUsersRepository);

    const user = await userRepository.findOne({ email });

    if (!user) {
      throw new AppError("User does not exists!");
    }

    const survey = await surveyRepository.findOne({ id: survey_id });

    if (!survey) {
      throw new AppError("Survey does not exists!");
    }

    const { title, description } = survey;

    const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");

    const variables = {
      name: user.name,
      title,
      description,
      link: process.env.URL_MAIL,
      id: "",
    };

    const surveyUserAlreadyExists = await surveyUserRepository.findOne({
      where: { user_id: user.id, survey_id: survey.id },
      relations: ["user", "survey"],
    });

    if (surveyUserAlreadyExists) {
      if (surveyUserAlreadyExists.value) {
        throw new AppError("Survey already sent and answered by user");
      }

      variables.id = surveyUserAlreadyExists.id;

      await SendMailService.execute(email, title, variables, npsPath);

      return response.json(surveyUserAlreadyExists);
    }

    const surveyUser = surveyUserRepository.create({
      user_id: user.id,
      survey_id,
    });

    await surveyUserRepository.save(surveyUser);

    variables.id = surveyUser.id;

    await SendMailService.execute(email, title, variables, npsPath);

    return response.json(surveyUser);
  }
}

export { SendMailController };
